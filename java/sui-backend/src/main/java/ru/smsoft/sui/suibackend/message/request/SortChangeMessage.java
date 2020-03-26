package ru.smsoft.sui.suibackend.message.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.smsoft.sui.suibackend.message.model.Sorting;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class SortChangeMessage {

  private List<Sorting> sorts;
}
