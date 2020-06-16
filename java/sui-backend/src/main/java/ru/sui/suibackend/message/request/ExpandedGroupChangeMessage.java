package ru.sui.suibackend.message.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.sui.suibackend.message.model.ExpandedGroup;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class ExpandedGroupChangeMessage {

  private List<ExpandedGroup> expandedGroups;

}
