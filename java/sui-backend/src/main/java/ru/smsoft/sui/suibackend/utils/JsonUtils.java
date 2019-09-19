package ru.smsoft.sui.suibackend.utils;

import lombok.val;
import org.json.JSONObject;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.JdbcUtils;
import ru.smsoft.sui.suisecurity.utils.TextUtils;

import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;


public class JsonUtils {

    public final static RowMapper<JSONObject> CAMEL_CASE_KEY_JSON_OBJECT_ROW_MAPPER = ((rs, rowNum) -> {
        val rsmd = rs.getMetaData();
        val columnCount = rsmd.getColumnCount();
        val jsonObject = new JSONObject();
        for (int i = 1; i <= columnCount; i++) {
            val column = TextUtils.toCamelCase(JdbcUtils.lookupColumnName(rsmd, i));
            val value = JdbcUtils.getResultSetValue(rs, i);
            jsonObject.put(column, value == null
                    ? JSONObject.NULL
                    : formatValue(value));
        }
        return jsonObject;
    });

    private static Object formatValue(Object value) {
        return (value instanceof Double && Double.isInfinite((Double) value))
                ? value.equals(Double.NEGATIVE_INFINITY)
                ? Constants.NEGATIVE_INFINITY
                : Constants.INFINITY
                : value;
    }

    public final static BiFunction<JSONObject, Predicate<String>, JSONObject> PREDICATE_CAMEL_CASE_JSON_OBJECT_KEY_MAPPER =
            (jsonObject, predicate) -> {
                val result = new JSONObject(jsonObject.keySet().size());
                jsonObject
                        .keySet()
                        .forEach(key -> result.put(
                                (predicate == null || predicate.test(key)) ? TextUtils.toCamelCase(key) : key,
                                jsonObject.get(key)));
                return result;
            };

    public final static Function<JSONObject, JSONObject> CAMEL_CASE_JSON_OBJECT_KEY_MAPPER =
            jsonObject -> PREDICATE_CAMEL_CASE_JSON_OBJECT_KEY_MAPPER.apply(jsonObject, null);

}
