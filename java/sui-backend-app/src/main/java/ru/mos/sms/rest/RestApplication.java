package ru.mos.sms.rest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.Ordered;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
//@EnableTransactionManagement(order = Ordered.LOWEST_PRECEDENCE - 1)
@ComponentScan(basePackages = {"ru.mos.sms.rest", "ru.smsoft.sui.suibackend"})
public class RestApplication extends SpringBootServletInitializer {

    @PostConstruct
    void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("Europe/Moscow"));
    }

    public static void main(String[] args) {
        SpringApplication.run(RestApplication.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(RestApplication.class);
    }

}
