package ru.smsoft.sui.suibackend.message.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.smsoft.sui.suibackend.message.model.filtering.Filtering;

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

}
