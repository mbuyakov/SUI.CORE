package ru.sui.suibackend.message.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.sui.suibackend.message.model.filtering.Filtering;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class FilterChangeMessage {

  private List<Filtering> filters;

}
