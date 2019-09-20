package ru.smsoft.sui.suibackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.smsoft.sui.suibackend.message.model.ExpandedGroup;
import ru.smsoft.sui.suibackend.message.model.Grouping;
import ru.smsoft.sui.suibackend.message.model.Sorting;
import ru.smsoft.sui.suibackend.message.model.filtering.Filtering;
import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;

import java.util.Collection;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class UserState {

    private TableInfo tableInfo;

    private Collection<Column> columns;

    private Long offset;

    private Long pageSize;

    private List<Grouping> groupings;

    private List<ExpandedGroup> expandedGroups;

    private List<Sorting> sorts;

    private List<Filtering> globalFilters;

    private List<Filtering> filters;

    private Collection<String> selection;

}