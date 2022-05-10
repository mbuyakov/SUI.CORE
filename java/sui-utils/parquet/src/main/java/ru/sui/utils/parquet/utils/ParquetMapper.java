package ru.sui.utils.parquet.utils;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.hadoop.fs.Path;
import org.apache.parquet.example.data.Group;
import org.apache.parquet.schema.OriginalType;
import org.apache.parquet.schema.PrimitiveType;
import org.jetbrains.annotations.NotNull;
import ru.sui.utils.parquet.annotation.ParquetField;
import ru.sui.utils.parquet.exception.FormatException;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.ParameterizedType;
import java.math.BigDecimal;
import java.math.MathContext;
import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Function;


@SuppressWarnings("unchecked")
@Slf4j
public class ParquetMapper<T> {

    private @Nonnull Class<T> genericClass;
    private boolean useAllFields;

    public ParquetMapper(@NotNull Class<T> genericClass) {
        this(genericClass, false);
    }
    public ParquetMapper(@NotNull Class<T> genericClass, boolean useAllFields) {
        this.genericClass = genericClass;
        this.useAllFields = useAllFields;
    }

    @SneakyThrows({IllegalAccessException.class})
    private <F> void setFieldOrConvert(
            Class<F> type,
            BiFunction<Integer, Integer, F> groupToTypeMapper,
            @Nullable Function<String, F> stringToTypeMapper,
            Field field,
            Object parquetObj,
            Group group,
            int parquetFieldIndex,
            Map<String, String> pathKeys
    ) {
        log.trace("Type is {}", type);
        Object fieldValue = null;
        val parquetFieldAnnotation = field.getAnnotation(ParquetField.class);
        val parquetFieldName = parquetFieldAnnotation != null ? parquetFieldAnnotation.value() : field.getName();
        val dirValue = pathKeys.get(parquetFieldName);
        if(dirValue != null) {
            if (dirValue.equals("null")) {
                if (!field.isAnnotationPresent(Nullable.class)) {
                    throw new FormatException("Field " + genericClass.getSimpleName() + "." + field + " value is null and field doesn't mark as @javax.annotation.Nullable");
                }
            } else {
                if (stringToTypeMapper == null) {
                    throw new RuntimeException("StringToTypeMapper for type \"" + type + "\n is null");
                }
                fieldValue = stringToTypeMapper.apply(dirValue);
            }
        } else {
            val repetitionCount = parquetFieldIndex == -1 ? 0 : group.getFieldRepetitionCount(parquetFieldIndex);

            // NPE check
            if (repetitionCount == 0 && !field.isAnnotationPresent(Nullable.class)) {
                throw new FormatException("Field " + genericClass.getSimpleName() + "." + field + " value is null and field doesn't mark as @javax.annotation.Nullable");
            } else if (repetitionCount > 1) {
                throw new FormatException("Field \"" + field + "\", repetitionCount = " + repetitionCount + ". Only 0 or 1 repetitionCount allowed");
            }

            if (repetitionCount != 0) {
                if (group.getType().getType(parquetFieldIndex).isPrimitive() && group.getType().getType(parquetFieldIndex).asPrimitiveType().getPrimitiveTypeName() == PrimitiveType.PrimitiveTypeName.BINARY) {
                    log.trace("Field type = binary. Convert");
                    if (stringToTypeMapper == null) {
                        throw new RuntimeException("StringToTypeMapper for type \"" + type + "\n is null");
                    }
                    fieldValue = stringToTypeMapper.apply(group.getBinary(parquetFieldIndex, 0).toStringUsingUTF8());
                } else {
                    fieldValue = groupToTypeMapper.apply(parquetFieldIndex, 0);
                }
            }
        }

        field.set(parquetObj, fieldValue);
    }

    @SneakyThrows({IllegalAccessException.class, InstantiationException.class, NoSuchMethodException.class, InvocationTargetException.class})
    public T groupToObj(Path path, Group group) {
        log.trace("Create {} obj", genericClass.getName());
        val parquetObj = genericClass.getDeclaredConstructor().newInstance();

        if (log.isTraceEnabled()) {
            log.trace("Parquet row: {}", group.toString());
        }

        val splittedPath = path.toString().split("/");
        val pathKeys = new HashMap<String, String>();
        for (String cur : splittedPath) {
            if(cur.contains("=")) {
                val splitted = cur.split("=");
                pathKeys.put(splitted[0], splitted[1]);
            }
        }


        for (val field : genericClass.getDeclaredFields()) {
            val parquetFieldAnnotation = field.getAnnotation(ParquetField.class);
            val directoryAnnotation = field.getAnnotation(Directory.class);
            if (parquetFieldAnnotation != null || directoryAnnotation != null || this.useAllFields) {
                if(this.useAllFields && field.getName().equals("serialVersionUID")) {
                    continue;
                }

                field.setAccessible(true);
                val parquetFieldName = parquetFieldAnnotation != null ? parquetFieldAnnotation.value() : field.getName();
                log.trace("Process field {}, parquetField {}", field.getName(), parquetFieldName);
                int parquetFieldIndex = -1;
                if (group.getType().containsField(parquetFieldName)) {
                    parquetFieldIndex = group.getType().getFieldIndex(parquetFieldName);
                }
                // NPE check
                if (parquetFieldIndex == -1 && (field.getAnnotation(Directory.class) != null|| this.useAllFields) && pathKeys.containsKey(parquetFieldName)) {
                    parquetFieldIndex = -2;
                }
                if (parquetFieldIndex == -1) if (field.isAnnotationPresent(Nullable.class)) continue; else {
                    throw new FormatException("Can't get value for field " + genericClass.getSimpleName() + "." + field.getName() + ". Field \"" + parquetFieldName + "\" not found and field doesn't mark as @javax.annotation.Nullable");
                }
                Class<Object> fieldType = (Class<Object>) field.getType();
                try {
                    if (String.class.isAssignableFrom(fieldType)) {
                        setFieldOrConvert(String.class, group::getString, String::valueOf, field, parquetObj, group, parquetFieldIndex, pathKeys);
                    } else if (Boolean.class.isAssignableFrom(fieldType) || fieldType.getName().equals("boolean")) {
                        setFieldOrConvert(Boolean.class, group::getBoolean, Boolean::valueOf, field, parquetObj, group, parquetFieldIndex, pathKeys);
                    } else if (Double.class.isAssignableFrom(fieldType) || fieldType.getName().equals("double")) {
                        setFieldOrConvert(Double.class, group::getDouble, Double::valueOf, field, parquetObj, group, parquetFieldIndex, pathKeys);
                    } else if (Long.class.isAssignableFrom(fieldType) || fieldType.getName().equals("long")) {
                        setFieldOrConvert(Long.class, group::getLong, Long::valueOf, field, parquetObj, group, parquetFieldIndex, pathKeys);
                    } else if (Integer.class.isAssignableFrom(fieldType) || fieldType.getName().equals("int")) {
                        setFieldOrConvert(Integer.class, group::getInteger, Integer::valueOf, field, parquetObj, group, parquetFieldIndex, pathKeys);
                    } else if (Date.class.isAssignableFrom(fieldType)) {
                        setFieldOrConvert(Date.class, (fieldIndex, index) -> {
                            if (group.getType().getType(fieldIndex).getOriginalType() == OriginalType.DATE) {
                                // 86400000 - ms in day
                                return new Date(((long) group.getInteger(fieldIndex, index)) * 86400000); // Date
                            } else {
                                return new Date(group.getLong(fieldIndex, index)); // Datetime
                            }
                        }, null, field, parquetObj, group, parquetFieldIndex, pathKeys);
                    } else if (Calendar.class.isAssignableFrom(fieldType)) {
                        setFieldOrConvert(Calendar.class, (fieldIndex, index) -> {
                            val calendar = Calendar.getInstance();
                            if (group.getType().getType(fieldIndex).getOriginalType() == OriginalType.DATE) {
                                // 86400000 - ms in day
                                calendar.setTimeInMillis(((long) group.getInteger(fieldIndex, index)) * 86400000); // Date
                            } else {
                                calendar.setTimeInMillis(group.getLong(fieldIndex, index)); // Datetime
                            }
                            return calendar;
                        }, null, field, parquetObj, group, parquetFieldIndex, pathKeys);
                    } else if (List.class.isAssignableFrom(fieldType)) {
                        log.trace("Type is List");
                        val listGenericClass = (Class<?>) ((ParameterizedType) field.getGenericType()).getActualTypeArguments()[0];
                        log.trace("List generic class: {}", listGenericClass);
                        // Group 0,0 - field "list"
                        // Each element in "list" field call "element"
                        // NPE check
                        val repetitionCount = group.getFieldRepetitionCount(parquetFieldIndex);
                        if (repetitionCount == 0) if (field.isAnnotationPresent(Nullable.class)) continue;
                        else {
                            throw new FormatException("Field " + genericClass.getSimpleName() + "." + field
                                    + " value is null and field doesn't mark as @javax.annotation.Nullable");
                        }
                        val listGroup = group.getGroup(parquetFieldIndex, 0);
                        val itemsElementCount = listGroup.getFieldRepetitionCount(0);
                        val objList = new ArrayList<>(itemsElementCount);
                        for (int itemIndex = 0; itemIndex < itemsElementCount; itemIndex++) {
                            val listItem = listGroup.getGroup(0 /*0 - "element"*/, itemIndex);
                            val listElementCount = listItem.getFieldRepetitionCount(0);
                            for (int j = 0; j < listElementCount; j++) {
                                val listElement = listItem.getGroup(0, j);
                                objList.add(new ParquetMapper<>(listGenericClass, this.useAllFields).groupToObj(path,listElement));
                            }
                        }
                        field.set(parquetObj, objList);
                    } else if (BigDecimal.class.isAssignableFrom(fieldType)) {
                        setFieldOrConvert(
                                BigDecimal.class,
                                (fieldIndex, index) -> new BigDecimal(group.getDouble(fieldIndex, index), MathContext.DECIMAL64),
                                BigDecimal::new, field, parquetObj, group, parquetFieldIndex, pathKeys
                        );
                    } else if (Integer.class.isAssignableFrom(fieldType)) {
                        setFieldOrConvert(Integer.class, group::getInteger, Integer::valueOf, field, parquetObj, group, parquetFieldIndex, pathKeys);
                    } else {
                        this.setFieldOrConvert(fieldType, (fieldIndex, index) -> new ParquetMapper<>(fieldType, this.useAllFields).groupToObj(path, group.getGroup(fieldIndex, index)), null, field, parquetObj, group, parquetFieldIndex, pathKeys);
//                        throw new FormatException("Unsupported parquetField type \"" + fieldType + "\" in class " + genericClass);
                    }
                } catch (ClassCastException | NumberFormatException e) {
                    log.error("Can't deserialize parquet file to POJO. Field " + genericClass.getSimpleName() + "." + field.getName(), e);
                    log.error("##########");
                    log.error("Debug info");
                    log.error("##########");
                    log.error("Field: {}", field);
                    log.error("Parquet annotation: {}", parquetFieldAnnotation);
                    log.error("Parquet field type: {}", group.getType().getType(parquetFieldIndex));
                    log.error("##########");

                    throw e;
                }
            }
        }

        return parquetObj;
    }

}
