package ru.rosneft.antifraud.pilot.usertransactionconfigurier.resolve;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@ConditionalOnProperty(PropertyResolveUserStrategy.USER_ID_PROPERTY)
public class PropertyResolveUserStrategy implements ResolveUserStrategy {

    public static final String USER_ID_PROPERTY = "setting.user.id";

    @Autowired
    private Environment environment;

    @Override
    public Long getUserId() {
        return Optional
                .ofNullable(environment.getProperty(USER_ID_PROPERTY))
                .map(Long::parseLong)
                .orElse(null);
    }

}
