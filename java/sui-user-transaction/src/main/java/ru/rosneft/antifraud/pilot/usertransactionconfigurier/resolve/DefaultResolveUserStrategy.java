package ru.rosneft.antifraud.pilot.usertransactionconfigurier.resolve;

import lombok.val;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import ru.smsoft.sui.suientity.entity.suisecurity.User;
import ru.smsoft.sui.suisecurity.security.UserPrincipal;

import java.util.Optional;

@Component
public class DefaultResolveUserStrategy implements ResolveUserStrategy {

    @Override
    public Long getUserId() {
        return getUserPrincipal()
                .map(UserPrincipal::getUser)
                .map(User::getId)
                .orElse(null);
    }

    private Optional<UserPrincipal> getUserPrincipal() {
        val principal = Optional
                .ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getPrincipal)
                .orElse(null);

        return (principal instanceof UserPrincipal)
                ? Optional.of((UserPrincipal) principal)
                : Optional.empty();
    }

}
