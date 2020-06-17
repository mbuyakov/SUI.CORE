package ru.sui.suibackend.utils;

import lombok.val;
import org.json.JSONObject;

import java.util.function.Function;

import static ru.sui.suibackend.utils.Constants.*;


public class JsonUtils {

  public final static Function<JSONObject, JSONObject> JSON_VALUE_FORMATTER =
    jsonObject -> {
      val result = new JSONObject(jsonObject.keySet().size());

      jsonObject
        .keySet()
        .forEach(key -> result.put(key, jsonObject.isNull(key) ? JSONObject.NULL : formatValue(jsonObject.get(key))));

      return result;
    };

  private static Object formatValue(Object value) {
    return (value instanceof Double && Double.isInfinite((Double) value))
      ? value.equals(Double.NEGATIVE_INFINITY)
      ? NEGATIVE_INFINITY
      : INFINITY
      : value;
  }

}
