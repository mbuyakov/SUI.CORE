package ru.smsoft.sui.suibackend.message.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.smsoft.sui.suibackend.message.model.Grouping;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class GroupingChangeMessage {

  private List<Grouping> groupings;

}
