package ru.sui.suibackend.service;

import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.List;

import static ru.sui.suibackend.utils.Constants.CHILDREN_FIELD_NAME;
import static ru.sui.suibackend.utils.Constants.LEVEL_COLUMN_NAME;

@Service
@Slf4j
public class TreeGenerator {

  int setChildren(
    List<JSONObject> groups, int currentIndex, JSONObject parent) {
    if (currentIndex >= groups.size()) {
      return 0;
    }
    JSONObject currentGroup = groups.get(currentIndex);
    int currentGroupLevel = currentGroup.getInt(LEVEL_COLUMN_NAME);
    int index = currentIndex + 1;

    while (index < groups.size()) {
      val indexGroup = groups.get(index);
      val indexGroupLevel = indexGroup.getInt(LEVEL_COLUMN_NAME);

      if (indexGroupLevel < currentGroupLevel) {
        index--;
        break;
      }

      if (indexGroupLevel == currentGroupLevel) {
        addChild(parent, indexGroup);
        currentGroup = indexGroup;
      } else {
        addChild(currentGroup, indexGroup);
        index += setChildren(groups, index, currentGroup);
      }

      index++;
    }

    return index - currentIndex;
  }

  @SuppressWarnings("unchecked")
  private void addChild(JSONObject parent, JSONObject child) {
    if (parent != null) {
      if (parent.has(CHILDREN_FIELD_NAME)) {
        ((JSONArray) parent.get(CHILDREN_FIELD_NAME)).put(child);
      } else {
        val children = new JSONArray();
        children.put(child);
        parent.put(CHILDREN_FIELD_NAME, children);
      }
    }
  }

}
