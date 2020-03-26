package ru.smsoft.sui.suibackend.message.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Sorting {

  @NotNull
  private String columnName;

  @NotNull
  private SortingDirection direction;
}
