package ru.smsoft.sui.suibackend.utils;

import ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringOperation;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringOperation.*;

public class Constants {

    public static final Set<FilteringOperation> IN_FILTERING_OPERATIONS =
            Collections.unmodifiableSet(Stream
                    .of(IN, NOT_IN, CONTAINS_ANY, NOT_CONTAINS_ANY, CONTAINS_ALL, NOT_CONTAINS_ALL)
                    .collect(Collectors.toSet()));

    public static final String SEND_TO_DESTINATION = "/queue/response";
    public static final String INFINITY = "∞";
    public static final String NEGATIVE_INFINITY = "-" + INFINITY;

    public static final String COMMON_PREFIX = "__";

    public static final String GROUPED_WITH_PREFIX = COMMON_PREFIX + "grouped_";
    public static final String GROUP_ELEMENTS_SUFFIX = COMMON_PREFIX + "elements";
    public static final String ALIAS_NAME_SUFFIX = COMMON_PREFIX + "name";
    public static final String GROUPING_PREFIX = COMMON_PREFIX + "grouping_";
    public static final String SUBTOTAL_PREFIX = COMMON_PREFIX + "subtotal_";
    public static final String COLUMN_SEPARATOR = ", ";

    public static final String ROW_NUMBER_COLUMN_NAME = COMMON_PREFIX + "row_number";
    public static final String SELECTED_COLUMN_NAME = COMMON_PREFIX + "selected";
    public static final String ELEMENTS_COLUMN_NAME = COMMON_PREFIX + "elements";
    public static final String RECORDS_COLUMN_NAME = COMMON_PREFIX + "records";
    public static final String EXPANDED_COLUMN_NAME = COMMON_PREFIX + "expanded";
    public static final String LEVEL_COLUMN_NAME = COMMON_PREFIX + "level";
    public static final String START_POSITION_COLUMN_NAME = COMMON_PREFIX + "start_position";
    public static final String END_POSITION_COLUMN_NAME = COMMON_PREFIX + "end_position";
    public static final String MAX_END_POSITION_COLUMN_NAME = COMMON_PREFIX + "max_end_position";
    public static final String FROM_POSITION_COLUMN_NAME = COMMON_PREFIX + "from_position";
    public static final String TO_POSITION_COLUMN_NAME = COMMON_PREFIX + "to_position";
    public static final String OFFSET_COLUMN_NAME = COMMON_PREFIX + "offset";
    public static final String GROUPS_COLUMN_NAME = COMMON_PREFIX + "groups";
    public static final String ROWS_COLUMN_NAME = COMMON_PREFIX + "rows";
    public static final String CHILDREN_FIELD_NAME = COMMON_PREFIX + "children";
    public static final String SUBTOTALS_FIELD_NAME = COMMON_PREFIX + "subtotals";

    public static final String FROM_WITH_NAME = COMMON_PREFIX + "from_with";
    public static final String DATA_WITH_NAME = GROUPED_WITH_PREFIX + "data";
    public static final String UNION_DATA_WITH_NAME = DATA_WITH_NAME + "_union";
    public static final String PAGED_DATA_WITH_NAME = DATA_WITH_NAME + "_paged";
    public static final String MAX_END_POSITION_WITH_NAME = COMMON_PREFIX + "max_end_position";
    public static final String FROM_TO_POSITIONS_WITH_NAME = COMMON_PREFIX + "from_to_positions";
    public static final String PAGED_FILTERED_DATA_WITH_NAME = PAGED_DATA_WITH_NAME + "_filtered";
    public static final String VISIBLE_GROUPS_WITH_NAME = COMMON_PREFIX + "visible_groups";
    public static final String EXPANDED_MAX_LEVEL_VISIBLE_GROUPS_WITH_NAME = COMMON_PREFIX + "expanded_max_level_visible_groups";
    public static final String FIRST_GROUP_OFFSET_WITH_NAME = COMMON_PREFIX + "first_group_offset";

    public static final String AND_FILTER_JOINER = " AND ";
    public static final String OR_FILTER_JOINER = " OR ";
}
