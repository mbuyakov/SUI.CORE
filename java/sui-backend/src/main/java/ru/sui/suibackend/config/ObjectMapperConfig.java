package ru.sui.suibackend.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsonorg.JsonOrgModule;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import ru.sui.suibackend.jackson.BackendJacksonModule;

import javax.annotation.PostConstruct;


@Configuration
@RequiredArgsConstructor
public class ObjectMapperConfig {

  @NonNull
  private ObjectMapper objectMapper;

  @PostConstruct
  private void configureObjectMapper() {
    objectMapper.registerModule(new JsonOrgModule());
    objectMapper.registerModule(new BackendJacksonModule());
    objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    // Don't change to JsonWriteFeature (2.9.9 projects issue, cause JsonWriteFeature since 2.10)
    objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
  }

}
