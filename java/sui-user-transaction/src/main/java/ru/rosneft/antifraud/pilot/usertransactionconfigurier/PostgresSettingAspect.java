package ru.rosneft.antifraud.pilot.usertransactionconfigurier;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.core.Ordered;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.NoTransactionException;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import ru.smsoft.sui.suisecurity.security.UserPrincipal;

import javax.persistence.EntityManager;
import java.util.Objects;
import java.util.Optional;

import static ru.smsoft.sui.suisecurity.utils.ConstantsKt.USER_ID_SETTING_NAME;


@Component
@Aspect
@Slf4j
@RequiredArgsConstructor
@EnableTransactionManagement(order = Ordered.LOWEST_PRECEDENCE - 1)
public class PostgresSettingAspect implements Ordered {

    @NonNull
    private EntityManager entityManager;

    @Before("execution(public * *(..)) && (bean(*Controller) || @annotation(WithUser))")
    public void appendCurrentUserSetting() {
        try {
            // check has transaction
            val transactionStatus = TransactionAspectSupport.currentTransactionStatus();

            if (transactionStatus.isNewTransaction()) {
                getUserPrincipal().ifPresent(userPrincipal -> entityManager
                        .createNativeQuery(
                                String.format(
                                        "SET LOCAL \"%s\" = '%s'",
                                        USER_ID_SETTING_NAME,
                                        Objects.toString(userPrincipal.getUser().getId())))
                        .executeUpdate());
            }
        } catch (NoTransactionException ignored) {
        }
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

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

}
