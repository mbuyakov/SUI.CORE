package ru.smsoft.sui.suibackend.utils;

import lombok.val;
import lombok.var;
import org.springframework.lang.NonNull;
import ru.smsoft.sui.suibackend.message.model.Sorting;
import ru.smsoft.sui.suibackend.message.model.SortingDirection;
import ru.smsoft.sui.suibackend.message.model.filtering.*;
import ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringOperation;
import ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringType;
import ru.smsoft.sui.suibackend.model.query.OrderNullBehavior;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static ru.smsoft.sui.suibackend.utils.Constants.*;


public class QueryUtils {

  public static String generateResultQuery(Map<String, String> withStatements, Collection<String> selectStatements) {
    return withStatements.keySet()
      .stream()
      .map(withName -> String.format("%s AS (%s)", withName, withStatements.get(withName)))
      .collect(Collectors.joining(COLUMN_SEPARATOR, "WITH ", "\n")) +
      String.join(" UNION ", selectStatements);
  }

  private static String mapColumnFilteringToQueryFilter(
    @NonNull ColumnFiltering columnFiltering, Function<ColumnFiltering, String> columnNameGetter) {
    val filteringOperationOptional = Optional.ofNullable(columnFiltering.getOperation());
    val columnName = columnNameGetter.apply(columnFiltering);

    if (columnFiltering instanceof InColumnFiltering) {
      val inColumnFiltering = (InColumnFiltering) columnFiltering;
      val elements = Optional
        .ofNullable(inColumnFiltering.getElements())
        .orElseGet(Collections::emptyList)
        .stream()
        .map(QueryUtils::formatSimpleFilteringValue)
        .collect(Collectors.toList());
      val hasNull = elements.stream().anyMatch(Objects::isNull);
      val operation = filteringOperationOptional.orElse(FilteringOperation.IN);
      val operationStr = operation.name().replace('_', ' ');


      val isIn = operation == FilteringOperation.IN || operation == FilteringOperation.NOT_IN;

      if (!hasNull || isIn) {
        if (isIn) {
          if (!elements.isEmpty()) {
            var inFilterStr = String.format(
              "%s %s (%s)",
              columnName,
              operationStr,
              elements.stream()
                .map(element -> '\'' + element + '\'')
                .collect(Collectors.joining(COLUMN_SEPARATOR)));

            if (hasNull) {
              inFilterStr += String.format(" OR %s IS NULL", columnName);
            }

            return inFilterStr;
          }
        } else if (operation.name().contains("CONTAINS")) {
          return String.format(
            "%s::TEXT %s (ARRAY[%s])",
            columnName,
            operationStr.replace("CONTAINS", "LIKE"),
            elements.stream()
              .map(element -> "'%" + element + "%'")
              .collect(Collectors.joining(COLUMN_SEPARATOR)));
        } else {
          throw new IllegalArgumentException("Operation \"" + operation + "\" isn't supported");
        }
      }

      return "FALSE";
    } else if (columnFiltering instanceof IntervalColumnFiltering) {
      val intervalColumnFiltering = (IntervalColumnFiltering) columnFiltering;
      val interval = intervalColumnFiltering.getValue();
      val index = new AtomicInteger();

      val filters = Arrays
        .stream(interval)
        .map(Optional::ofNullable)
        .map(valueOpt -> valueOpt
          .map(value -> new SimpleColumnFiltering(
            columnName,
            (index.getAndIncrement() == 0)
              ? FilteringOperation.GREATER_THAN_OR_EQUAL
              : FilteringOperation.LESS_THAN_OR_EQUAL,
            intervalColumnFiltering.isRaw(),
            value))
          .orElse(null))
        .filter(Objects::nonNull)
        .collect(Collectors.toList());

      return filters.isEmpty() ? "TRUE" : joinFilters(AND_FILTER_JOINER, filters);
    } else if (columnFiltering instanceof SimpleColumnFiltering) {
      val simpleColumnFiltering = (SimpleColumnFiltering) columnFiltering;
      String filterFormat;
      val filteringOperation = filteringOperationOptional.orElse(FilteringOperation.EQUAL);

      if (simpleColumnFiltering.getValue() == null
        || "null".equalsIgnoreCase(simpleColumnFiltering.getValue())) {
        switch (filteringOperation) {
          case EQUAL:
          case CONTAINS:
            filterFormat = "%s IS NULL";
            break;
          case NOT_EQUAL:
          case NOT_CONTAINS:
            filterFormat = "%s IS NOT NULL";
            break;
          default:
            throw new IllegalArgumentException(
              "Unsupported operation for null: " + columnFiltering.getOperation());
        }
      } else {
        String operation = null;
        String valuePattern = null;
        String castType = null;

        switch (filteringOperation) {
          case EQUAL:
            operation = "=";
            valuePattern = "%s";
            break;
          case NOT_EQUAL:
            operation = "<>";
            valuePattern = "%s";
            break;
          case GREATER_THAN:
            operation = ">";
            valuePattern = "%s";
            break;
          case GREATER_THAN_OR_EQUAL:
            operation = ">=";
            valuePattern = "%s";
            break;
          case LESS_THAN:
            operation = "<";
            valuePattern = "%s";
            break;
          case LESS_THAN_OR_EQUAL:
            operation = "<=";
            valuePattern = "%s";
            break;
          case CONTAINS:
            operation = "ILIKE";
            valuePattern = "%%%s%%";
            castType = "::TEXT";
            break;
          case NOT_CONTAINS:
            operation = "NOT ILIKE";
            valuePattern = "%%%s%%";
            castType = "::TEXT";
            break;
          case STARTS_WITH:
            operation = "ILIKE";
            valuePattern = "%s%%";
            castType = "::TEXT";
            break;
          case ENDS_WITH:
            operation = "ILIKE";
            valuePattern = "%%%s";
            castType = "::TEXT";
        }

        filterFormat = String.format(
          "%s%s %s '%s'",
          "%s",
          Optional.ofNullable(castType).orElse(""),
          operation,
          valuePattern);
      }

      return String.format(
        filterFormat,
        columnName,
        formatSimpleFilteringValue(simpleColumnFiltering.getValue()));
    } else {
      throw new IllegalArgumentException("Unsupported column filtering class: " + columnFiltering.getClass());
    }
  }

  private static String mapColumnName(String name, Function<String, String> mapper) {
    return mapper != null ? mapper.apply(name) : name;
  }

  private static String mapFilteringToQueryFilter(
    Filtering filtering, Function<ColumnFiltering, String> columnNameGetter) {
    val type = filtering.getType();
    val resultColumnNameGetter = columnNameGetter != null
      ? columnNameGetter
      : ColumnFiltering::getColumnName;

    if (type == FilteringType.PREDICATE) {
      val predicateFiltering = (PredicateFiltering) filtering;
      val predicate = predicateFiltering.getPredicate();
      val filters = predicateFiltering.getFilters();

      if (filters == null || filters.isEmpty()) {
        throw new IllegalArgumentException("Predicate filtering elements can not be null or empty");
      }

      switch (predicateFiltering.getPredicate()) {
        case OR:
        case AND:
          return joinFilters(" " + predicate.toString() + " ", filters, resultColumnNameGetter);
        case NOT:
          if (filters.size() == 1) {
            return String.format("NOT (%s)", mapFilteringToQueryFilter(filters.get(0), resultColumnNameGetter));
          } else {
            throw new IllegalArgumentException("Not predicate filtering elements size > 1");
          }
        default:
          throw new IllegalArgumentException("Unsupported filtering predicate: " + type);
      }
    } else if (type == FilteringType.COLUMN) {
      return mapColumnFilteringToQueryFilter((ColumnFiltering) filtering, resultColumnNameGetter);
    } else {
      throw new IllegalArgumentException("Unsupported filtering type: " + type);
    }
  }

  // JOINS

  private static String joinFilters(
    Collector<CharSequence, ?, String> collector,
    Stream<? extends Filtering> filteringStream,
    Function<ColumnFiltering, String> columnNameGetter) {
    return filteringStream
      .map(filtering -> mapFilteringToQueryFilter(filtering, columnNameGetter))
      .collect(collector);
  }

  // Join streams

  public static String joinFilters(
    @NonNull String delimiter,
    @NonNull Stream<? extends Filtering> filteringStream,
    Function<ColumnFiltering, String> columnNameGetter) {
    return joinFilters(
      Collectors.joining(delimiter, "(", ")"),
      filteringStream,
      columnNameGetter);
  }

  public static String joinFilters(
    @NonNull String delimiter,
    @NonNull Stream<? extends Filtering> filtering) {
    return joinFilters(delimiter, filtering, null);
  }

  // Join collections

  public static String joinFilters(
    @NonNull String delimiter,
    @NonNull Collection<? extends Filtering> filtering,
    Function<ColumnFiltering, String> columnNameGetter) {
    return joinFilters(delimiter, filtering.stream(), columnNameGetter);
  }

  public static String joinFilters(
    @NonNull String delimiter,
    @NonNull Collection<? extends Filtering> filtering) {
    return joinFilters(delimiter, filtering, null);
  }

  // SORT
  public static String generateSortCondition(Collection<Sorting> sorts, Long limit, Long offset) {
    String sortCondition = "";

    if (sorts != null && !sorts.isEmpty()) {
      sortCondition += "ORDER BY " + generateOrderByInnerStatement(sorts, (OrderNullBehavior) null);
    }

    if (limit != null) {
      sortCondition += " LIMIT " + limit;
    }

    if (offset != null) {
      sortCondition += " OFFSET " + offset;
    }

    return sortCondition;
  }

  public static String generateOrderByInnerStatement(Collection<Sorting> sorts, OrderNullBehavior behavior) {
    return generateOrderByInnerStatement(
      sorts,
      (behavior != null)
        ? sorts.stream().map(Sorting::getColumnName).collect(Collectors.toMap(Function.identity(), (column) -> behavior))
        : null);
  }

  public static String generateOrderByInnerStatement(Collection<Sorting> sorts, Map<String, OrderNullBehavior> behaviors) {
    val safeBehaviors = Optional.ofNullable(behaviors).orElse(Collections.emptyMap());

    return sorts.stream()
      .map(sorting -> String.format(
        "%s %s %s",
        sorting.getColumnName(),
        Optional.ofNullable(sorting.getDirection()).orElse(SortingDirection.ASC),
        Optional.ofNullable(safeBehaviors.get(sorting.getColumnName()))
          .map(behavior -> "NULLS " + behavior.name())
          .orElse("")))
      .map(String::trim)
      .collect(Collectors.joining(COLUMN_SEPARATOR));
  }

  private static String formatSimpleFilteringValue(Object value) {
    val valueStr = Objects.toString(value);

    switch (valueStr) {
      case INFINITY:
      case NEGATIVE_INFINITY:
        return valueStr.replaceFirst(INFINITY, "infinity");
      default:
        return valueStr;
    }
  }

}
