package ru.sui.suimetaschemaservice.config;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.Resource;
import org.springframework.lang.Nullable;
import org.springframework.util.ResourceUtils;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration("queryConfig")
@RequiredArgsConstructor
@Slf4j
public class PropertySourceConfig {

    private static final String DEFAULT_QUERIES_LOCATION_PATTERN = "queries/*.sql";

    @Value("${sql.query.pattern:" + DEFAULT_QUERIES_LOCATION_PATTERN + "}")
    private String queriesLocationPattern;
    @NonNull
    private ApplicationContext applicationContext;
    @NonNull
    private ConfigurableEnvironment environment;

    @PostConstruct
    public void init() {
        try {
            Resource[] resources = applicationContext
                    .getResources(
                            String.format(
                                    "%s%s",
                                    ResourceUtils.CLASSPATH_URL_PREFIX,
                                    queriesLocationPattern));

            if (resources.length > 0) {
                Map<String, String> propertyMap = Arrays
                        .stream(resources)
                        .collect(Collectors.toMap(
                                (Resource resource) -> {
                                    String fileName = resource.getFilename();
                                    return String.format("sql.query.%s", fileName.substring(0, fileName.length() - 4));
                                },
                                (Resource resource) -> {
                                    try {
                                        return IOUtils.toString(resource.getInputStream(), StandardCharsets.UTF_8);
                                    } catch (IOException exception) {
                                        log.error(
                                                String.format("Couldn't read file %s", resource.getFilename()),
                                                exception);
                                        throw new RuntimeException(exception);
                                    }
                                }));

                environment.getPropertySources().addLast(new QueryPropertySource(propertyMap));
            } else {
                throw new IOException("count queries == 0");
            }
        } catch (IOException exception) {
            log.warn("Couldn't found queries directory (resources)", exception);
            throw new RuntimeException(exception);
        }
    }

    private class QueryPropertySource extends PropertySource<String> {

        private Map<String, String> propertyMap;

        private QueryPropertySource(Map<String, String> propertyMap) {
            super("queries");
            this.propertyMap = propertyMap;
        }

        @Override
        public String getProperty(@Nullable String name) {
            return propertyMap.get(name);
        }
    }

}
