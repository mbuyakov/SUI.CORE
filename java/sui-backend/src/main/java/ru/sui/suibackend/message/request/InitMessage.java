package ru.sui.suibackend.message.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.sui.suibackend.message.model.ExpandedGroup;
import ru.sui.suibackend.message.model.Grouping;
import ru.sui.suibackend.message.model.Sorting;
import ru.sui.suibackend.message.model.filtering.Filtering;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class InitMessage {

  private Long tableInfoId;

  private Long currentPage;

  private Long pageSize;

  private List<Filtering> defaultFilters;

  private List<Filtering> globalFilters;

  private List<Sorting> sorts;

  private List<Grouping> groupings;

  private List<ExpandedGroup> expandedGroups;

}
