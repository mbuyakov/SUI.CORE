package ru.smsoft.sui.suibackend.utils;

import lombok.val;
import org.json.JSONObject;
import ru.smsoft.sui.suisecurity.utils.TextUtils;

import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;

import static ru.smsoft.sui.suibackend.utils.Constants.INFINITY;
import static ru.smsoft.sui.suibackend.utils.Constants.NEGATIVE_INFINITY;


public class JsonUtils {

    public final static BiFunction<JSONObject, Predicate<String>, JSONObject> PREDICATE_CAMEL_CASE_JSON_OBJECT_KEY_MAPPER =
            (jsonObject, predicate) -> {
                val result = new JSONObject(jsonObject.keySet().size());
                jsonObject
                        .keySet()
                        .forEach(key -> result.put(
                                (predicate == null || predicate.test(key)) ? TextUtils.toCamelCase(key) : key,
                                jsonObject.isNull(key) ? JSONObject.NULL : formatValue(jsonObject.get(key))));
                return result;
            };

    public final static Function<JSONObject, JSONObject> CAMEL_CASE_JSON_OBJECT_KEY_MAPPER =
            jsonObject -> PREDICATE_CAMEL_CASE_JSON_OBJECT_KEY_MAPPER.apply(jsonObject, null);

    private static Object formatValue(Object value) {
        return (value instanceof Double && Double.isInfinite((Double) value))
                ? value.equals(Double.NEGATIVE_INFINITY)
                ? NEGATIVE_INFINITY
                : INFINITY
                : value;
    }

}
