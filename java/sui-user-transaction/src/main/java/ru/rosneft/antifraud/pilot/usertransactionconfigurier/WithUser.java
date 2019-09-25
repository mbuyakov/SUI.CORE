package ru.rosneft.antifraud.pilot.usertransactionconfigurier;

import java.lang.annotation.*;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface WithUser {}
