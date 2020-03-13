package ru.smsoft.sui.usertransactionconfigurier;

import org.springframework.lang.Nullable;
import ru.smsoft.sui.usertransactionconfigurier.resolve.DefaultResolveUserStrategy;
import ru.smsoft.sui.usertransactionconfigurier.resolve.ResolveUserStrategy;

import java.lang.annotation.*;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface WithUser {

    Class<? extends ResolveUserStrategy> strategy() default DefaultResolveUserStrategy.class;
    @Nullable String beanName() default "";

}
