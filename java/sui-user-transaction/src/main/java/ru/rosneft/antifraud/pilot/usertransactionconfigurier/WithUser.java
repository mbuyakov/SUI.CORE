package ru.rosneft.antifraud.pilot.usertransactionconfigurier;

import org.springframework.lang.Nullable;
import ru.rosneft.antifraud.pilot.usertransactionconfigurier.resolve.DefaultResolveUserStrategy;
import ru.rosneft.antifraud.pilot.usertransactionconfigurier.resolve.ResolveUserStrategy;

import java.lang.annotation.*;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface WithUser {

    Class<? extends ResolveUserStrategy> strategy() default DefaultResolveUserStrategy.class;
    @Nullable String beanName() default "";

}
