package ru.sui.suibackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.json.JSONArray;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class PageData {

  private long totalCount;

  @Builder.Default
  private JSONArray data = new JSONArray();
}
