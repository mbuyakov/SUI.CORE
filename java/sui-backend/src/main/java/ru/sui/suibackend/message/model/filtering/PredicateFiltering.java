package ru.sui.suibackend.message.model.filtering;

import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.sui.suibackend.message.model.filtering.enumeration.FilteringPredicate;
import ru.sui.suibackend.message.model.filtering.enumeration.FilteringType;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class PredicateFiltering extends Filtering {

  private FilteringPredicate predicate;

  private List<Filtering> filters;

  PredicateFiltering() {
    super(FilteringType.PREDICATE);
  }

  public PredicateFiltering(FilteringPredicate predicate, List<Filtering> filters) {
    this();
    this.predicate = predicate;
    this.filters = filters;
  }
}
