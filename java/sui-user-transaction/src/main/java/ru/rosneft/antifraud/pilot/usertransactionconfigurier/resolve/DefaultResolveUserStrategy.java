package ru.rosneft.antifraud.pilot.usertransactionconfigurier.resolve;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;

import java.util.Objects;
import java.util.Optional;

@Component
// TODO: Мусор, вынести UserPrincipal из sui-security
public class DefaultResolveUserStrategy implements ResolveUserStrategy {

    @Override
    public Long getUserId() {
        return Optional
                .ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getPrincipal)
                .map(principal -> getFieldValue(principal, "user", principal.getClass()))
                .map(user -> getFieldValue(user, "id", Long.class))
                .orElse(null);
    }

    @SuppressWarnings("unchecked")
    private <T> T getFieldValue(Object object, String fieldName, Class<T> tClass) {
      return Optional
        .ofNullable(ReflectionUtils.findField(object.getClass(), fieldName))
        .map(field -> (T) ReflectionUtils.getField(field, object))
        .orElse(null);
    }

}
