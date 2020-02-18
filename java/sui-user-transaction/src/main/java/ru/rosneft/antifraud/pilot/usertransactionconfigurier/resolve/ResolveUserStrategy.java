package ru.rosneft.antifraud.pilot.usertransactionconfigurier.resolve;

import org.springframework.lang.Nullable;

public interface ResolveUserStrategy {

    @Nullable Long getUserId();

}
