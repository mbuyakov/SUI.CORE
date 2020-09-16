package ru.sui.suibackend.model.query;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum JoinType {

  INNER_JOIN("INNER JOIN"),
  CROSS_JOIN("CROSS JOIN"),
  LEFT_JOIN("LEFT JOIN"),
  RIGHT_JOIN("RIGHT JOIN"),
  FULL_JOIN("FULL JOIN");

  private final String statement;

}
