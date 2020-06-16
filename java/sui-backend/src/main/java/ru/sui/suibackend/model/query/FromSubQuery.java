package ru.sui.suibackend.model.query;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.lang.NonNull;

@AllArgsConstructor
@Getter
@Builder
public class FromSubQuery implements TableSegment {

  private final @NonNull
  String alias;
  private final @NonNull
  String query;

  @Override
  public @NonNull
  String getAlias() {
    return this.alias;
  }

  @Override
  public @NonNull
  String getStatement() {
    return String.format("(%s)", query);
  }

  @Override
  public @NonNull
  String toString() {
    return getAlias();
  }

}
