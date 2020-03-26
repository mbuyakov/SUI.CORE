package ru.smsoft.sui.suibackend.model.query;

import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

public interface TableSegment {

  @Nullable
  String getAlias();

  @NonNull
  String getStatement();

  @NonNull
  String toString();

}
