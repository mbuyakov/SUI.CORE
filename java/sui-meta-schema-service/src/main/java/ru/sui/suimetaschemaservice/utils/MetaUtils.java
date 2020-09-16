package ru.sui.suimetaschemaservice.utils;

import lombok.val;
import ru.sui.suientity.entity.suimeta.ColumnInfo;

import java.util.Collection;
import java.util.Comparator;
import java.util.concurrent.atomic.AtomicInteger;

public class MetaUtils {

    public static void orderColumns(Collection<ColumnInfo> columnInfos) {
        val position = new AtomicInteger(0);

        columnInfos
                .stream()
                .sorted(Comparator.comparing(
                        ColumnInfo::getOrder,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .forEach(columnInfo -> columnInfo.setOrder(position.getAndIncrement()));
    }

}
