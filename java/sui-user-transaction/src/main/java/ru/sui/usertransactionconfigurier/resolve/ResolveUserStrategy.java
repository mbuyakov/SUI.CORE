package ru.sui.usertransactionconfigurier.resolve;

import org.springframework.lang.Nullable;

public interface ResolveUserStrategy {

    @Nullable Long getUserId();

}
