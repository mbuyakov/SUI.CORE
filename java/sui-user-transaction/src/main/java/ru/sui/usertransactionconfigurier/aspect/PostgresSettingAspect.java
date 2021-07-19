package ru.sui.usertransactionconfigurier.aspect;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.context.ApplicationContext;
import org.springframework.core.Ordered;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.NoTransactionException;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import ru.sui.usertransactionconfigurier.WithUser;
import ru.sui.usertransactionconfigurier.resolve.DefaultResolveUserStrategy;

import javax.persistence.EntityManager;
import java.util.Optional;

// import static ru.sui.suisecurity.utils.ConstantsKt.USER_ID_SETTING_NAME;


@Component
@Aspect
@Slf4j
@RequiredArgsConstructor
public class PostgresSettingAspect implements Ordered {

    @NonNull
    private ApplicationContext applicationContext;
    @NonNull
    private EntityManager entityManager;
    @NonNull
    private DefaultResolveUserStrategy defaultResolveUserStrategy;

    @Before("execution(public * *(..)) && bean(*Controller) && !@annotation(ru.sui.usertransactionconfigurier.WithUser)")
    public void appendCurrentUserSetting() {
        appendCurrentUserSetting(defaultResolveUserStrategy.getUserId());
    }

    @Before("@annotation(withUser))")
    public void appendCurrentUserSetting(WithUser withUser) {
        val strategyClass = withUser.strategy();
        val strategyBeanName = withUser.beanName();

        val strategy = !strategyBeanName.isEmpty()
                ? applicationContext.getBean(strategyBeanName, strategyClass)
                : applicationContext.getBean(strategyClass);

        appendCurrentUserSetting(strategy.getUserId());
    }

    private void appendCurrentUserSetting(@Nullable Long userId) {
        Optional.ofNullable(userId)
                .ifPresent(id -> {
                    try {
                        // check has transaction
                        TransactionAspectSupport.currentTransactionStatus();

                        entityManager
                                // .createNativeQuery(String.format("SET LOCAL \"%s\" = '%s'", USER_ID_SETTING_NAME, id))
                                .createNativeQuery(String.format("SET LOCAL \"%s\" = '%s'", "user.id", id)) // TODO: USER_ID_SETTING_NAME брать из sui-security
                                .executeUpdate();
                    } catch (NoTransactionException ignored) {}
                });
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

}
