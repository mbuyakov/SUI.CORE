package ru.sui.suimetaschemaservice.service;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.DependsOn;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.sui.suientity.entity.suimeta.ColumnInfo;
import ru.sui.suientity.entity.suimeta.ColumnInfoReference;
import ru.sui.suientity.entity.suimeta.TableInfo;
import ru.sui.suientity.repository.suimeta.ColumnInfoReferenceRepository;
import ru.sui.suientity.repository.suimeta.ColumnInfoRepository;
import ru.sui.suientity.repository.suimeta.TableInfoRepository;
import ru.sui.suimetaschemaservice.model.*;
import ru.sui.suimetaschemaservice.utils.MetaUtils;

import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service

@Slf4j
@RequiredArgsConstructor
@DependsOn("queryConfig")
public class MetaSchemaRefresher {

    @Value("${sql.query.get-information-schema-tables}")
    private String informationSchemaTablesQuery;
    @Value("${sql.query.get-information-schema-columns}")
    private String informationSchemaColumnsQuery;
    @Value("${sql.query.get-possible-references}")
    private String possibleReferencesQuery;
    @Value("${sui.mss.schemas:}")
    private String schemasProperty;

    @NonNull
    private JdbcTemplate jdbcTemplate;
    @NonNull
    private TableInfoRepository tableInfoRepository;
    @NonNull
    private ColumnInfoRepository columnInfoRepository;
    @NonNull
    private ColumnInfoReferenceRepository columnInfoReferenceRepository;

    @Transactional
    public MetaState refreshSchema() {
        val metaState = getMetaState();
        saveMetaState(metaState);
        return metaState;
    }

    private MetaState getMetaState() {
        val schemas = Arrays
            .stream(schemasProperty.split(","))
            .map(String::trim)
            .filter(schema -> !schema.isEmpty())
            .map(schema -> String.format("'%s'", schema))
            .collect(Collectors.joining(","));

        if (schemas.isEmpty()) {
          throw new IllegalArgumentException("Property sui.mss.schemas cannot be empty");
        }

        // Select possible meta schema
        List<InformationSchemaTable> possibleTables = jdbcTemplate.query(
                String.format(informationSchemaTablesQuery, schemas),
                (row, rowNum) -> InformationSchemaTable.builder()
                        .tableSchema(row.getString("table_schema"))
                        .tableName(row.getString("table_name"))
                        .tableType(row.getString("table_type"))
                        .build());

        List<InformationSchemaColumn> possibleColumns = jdbcTemplate.query(
                String.format(informationSchemaColumnsQuery, schemas),
                (row, rowNum) -> InformationSchemaColumn.builder()
                        .tableSchema(row.getString("table_schema"))
                        .tableName(row.getString("table_name"))
                        .columnName(row.getString("column_name"))
                        .columnType(row.getString("column_type"))
                        .columnDefault(row.getString("column_default"))
                        .isNullable(row.getBoolean("is_nullable"))
                        .build());

        List<PossibleReference> possibleReferences = jdbcTemplate.query(
                String.format(possibleReferencesQuery, schemas),
                (row, rowNum) -> PossibleReference.builder()
                        .columnTableSchema(row.getString("column_table_schema"))
                        .columnTableName(row.getString("column_table_name"))
                        .columnName(row.getString("column_name"))
                        .foreignColumnTableSchema(row.getString("foreign_column_table_schema"))
                        .foreignColumnTableName(row.getString("foreign_column_table_name"))
                        .foreignColumnName(row.getString("foreign_column_name"))
                        .build());

        // Select existing meta schema
        val existingTableInfos =
                tableInfoRepository.findAllWithColumnInfoAndReferences();

        val existingColumnInfos =
                aggregateCollectionProperty(existingTableInfos, TableInfo::getColumnInfos);

        val existingColumnInfoReferences =
                aggregateCollectionProperty(existingColumnInfos, ColumnInfo::getReferences);

        // generate tableInfoMetaInfo
        val tableInfoMetaInfo =
                generateMetaElementMap(
                        possibleTables,
                        existingTableInfos,
                        (informationSchemaTable, initValue) -> {
                            // without builder for stop duplicating objects
                            TableInfo tableInfo = Optional.ofNullable(initValue).orElseGet(TableInfo::new);
                            tableInfo.setSchemaName(informationSchemaTable.getTableSchema());
                            tableInfo.setTableName(informationSchemaTable.getTableName());
                            tableInfo.setType(informationSchemaTable.getTableType());
                            // Временный костыль
                            tableInfo.setEngineId(1L);
                            return tableInfo;
                        },
                        tableInfo -> InformationSchemaTable.builder()
                                .tableSchema(tableInfo.getSchemaName())
                                .tableName(tableInfo.getTableName())
                                .tableType(tableInfo.getType())
                                .build());

        val tableInfoByInformationSchemaTable = tableInfoMetaInfo.getMetaElementMap();

        // generate columnInfoMetaInfo
        val columnInfoMetaInfo =
                generateMetaElementMap(
                        possibleColumns,
                        existingColumnInfos,
                        (informationSchemaColumn, initValue) -> {
                            // without builder for stop duplicating objects
                            ColumnInfo columnInfo = Optional.ofNullable(initValue).orElseGet(ColumnInfo::new);
                            columnInfo.setTableInfo(tableInfoByInformationSchemaTable.get(InformationSchemaTable.builder()
                                    .tableSchema(informationSchemaColumn.getTableSchema())
                                    .tableName(informationSchemaColumn.getTableName())
                                    .build()));
                            columnInfo.setColumnName(informationSchemaColumn.getColumnName());
                            columnInfo.setColumnType(informationSchemaColumn.getColumnType());
                            columnInfo.setDefaultValue(informationSchemaColumn.getColumnDefault());
                            columnInfo.setIsNullable(informationSchemaColumn.getIsNullable());
                            return columnInfo;
                        },
                        columnInfo -> InformationSchemaColumn.builder()
                                .tableSchema(columnInfo.getTableInfo().getSchemaName())
                                .tableName(columnInfo.getTableInfo().getTableName())
                                .columnName(columnInfo.getColumnName())
                                .columnType(columnInfo.getColumnType())
                                .columnDefault(columnInfo.getDefaultValue())
                                .isNullable(columnInfo.getIsNullable())
                                .build());

        val columnInfoByInformationSchemaColumn = columnInfoMetaInfo.getMetaElementMap();
        columnInfoMetaInfo.getNonexistentElements().forEach(columnInfo ->
                Optional.ofNullable(columnInfo.getTableInfo())
                        .ifPresent(tableInfo -> {
                            if (columnInfo.equals(tableInfo.getLinkColumnInfo())) {
                                tableInfo.setLinkColumnInfo(null);
                            }
                            if (columnInfo.equals(tableInfo.getForeignLinkColumnInfo())) {
                                tableInfo.setForeignLinkColumnInfo(null);
                            }
                        }));

        // generate columnInfoReferenceMetaInfo
        val columnInfoReferenceMetaInfo =
                generateMetaElementMap(
                        possibleReferences,
                        existingColumnInfoReferences,
                        (possibleReference, initValue) -> {
                            // without builder for stop duplicating objects
                            ColumnInfoReference columnInfoReference =
                                    Optional.ofNullable(initValue).orElseGet(ColumnInfoReference::new);
                            columnInfoReference.setColumnInfo(
                                    columnInfoByInformationSchemaColumn.get(
                                            InformationSchemaColumn.builder()
                                                    .tableSchema(possibleReference.getColumnTableSchema())
                                                    .tableName(possibleReference.getColumnTableName())
                                                    .columnName(possibleReference.getColumnName())
                                                    .build()));
                            columnInfoReference.setForeignColumnInfo(columnInfoByInformationSchemaColumn.get(
                                    InformationSchemaColumn.builder()
                                            .tableSchema(possibleReference.getForeignColumnTableSchema())
                                            .tableName(possibleReference.getForeignColumnTableName())
                                            .columnName(possibleReference.getForeignColumnName())
                                            .build()));
                            return columnInfoReference;
                        },
                        columnInfoReference -> PossibleReference.builder()
                                .columnTableSchema(columnInfoReference
                                        .getColumnInfo()
                                        .getTableInfo()
                                        .getSchemaName())
                                .columnTableName(columnInfoReference
                                        .getColumnInfo()
                                        .getTableInfo()
                                        .getTableName())
                                .columnName(columnInfoReference
                                        .getColumnInfo()
                                        .getColumnName())
                                .foreignColumnTableSchema(columnInfoReference
                                        .getForeignColumnInfo()
                                        .getTableInfo()
                                        .getSchemaName())
                                .foreignColumnTableName(columnInfoReference
                                        .getForeignColumnInfo()
                                        .getTableInfo()
                                        .getTableName())
                                .foreignColumnName(columnInfoReference
                                        .getForeignColumnInfo()
                                        .getColumnName())
                                .build());

        return MetaState
                .builder()
                .tableInfoMetaInfo(tableInfoMetaInfo)
                .columnInfoMetaInfo(columnInfoMetaInfo)
                .columnInfoReferenceMetaInfo(columnInfoReferenceMetaInfo)
                .build();
    }

    private void saveMetaState(MetaState metaState) {
        val tableInfoMetaInfo = metaState.getTableInfoMetaInfo();
        val tableInfoByInformationSchemaTable = tableInfoMetaInfo.getMetaElementMap();
        val columnInfoMetaInfo = metaState.getColumnInfoMetaInfo();
        val columnInfoByInformationSchemaColumn = metaState.getColumnInfoMetaInfo().getMetaElementMap();
        val columnInfoReferenceMetaInfo = metaState.getColumnInfoReferenceMetaInfo();
        val columnInfoReferenceByPossibleReference = columnInfoReferenceMetaInfo.getMetaElementMap();

        val groupedColumnInfos = groupBy(
                columnInfoByInformationSchemaColumn.values(),
                ColumnInfo::getTableInfo,
                LinkedHashSet::new);

        val groupedColumnInfoReferences = groupBy(
                columnInfoReferenceByPossibleReference.values(),
                ColumnInfoReference::getColumnInfo,
                LinkedHashSet::new);

        // order Columns
        groupedColumnInfos.values().forEach(MetaUtils::orderColumns);

        // Save new tables
        saveNewElements(tableInfoMetaInfo.getNewElements(), tableInfoRepository);

        // Save new columns
        saveNewElements(columnInfoMetaInfo.getNewElements(), columnInfoRepository);

        // Clear old childrens
        tableInfoByInformationSchemaTable
                .values()
                .forEach(tableInfo ->
                        resetCollectionProperty(
                                tableInfo.getColumnInfos(),
                                tableInfo::setColumnInfos,
                                LinkedHashSet::new));
        columnInfoByInformationSchemaColumn
                .values()
                .forEach(columnInfo ->
                        resetCollectionProperty(
                                columnInfo.getReferences(),
                                columnInfo::setReferences,
                                LinkedHashSet::new));

        // Collect new childrens
        groupedColumnInfos.forEach(
                (tableInfo, columnInfos) -> tableInfo.getColumnInfos().addAll(columnInfos));
        groupedColumnInfoReferences.forEach(
                (columnInfo, columnInfoReferences) -> columnInfo.getReferences().addAll(columnInfoReferences));

        if (!columnInfoReferenceMetaInfo.getNonexistentElements().isEmpty()) {
            columnInfoReferenceRepository.deleteInBatch(columnInfoReferenceMetaInfo.getNonexistentElements());
        }
        if (!columnInfoMetaInfo.getNonexistentElements().isEmpty()) {
            columnInfoRepository.deleteInBatch(columnInfoMetaInfo.getNonexistentElements());
        }
        if (!tableInfoMetaInfo.getNonexistentElements().isEmpty()) {
            tableInfoRepository.deleteInBatch(tableInfoMetaInfo.getNonexistentElements());
        }

        tableInfoRepository.saveAll(tableInfoMetaInfo.getMetaElementMap().values());
    }

    private <E, V> List<V> aggregateCollectionProperty(
            List<E> elements, Function<E, Collection<V>> mapper) {
        val result = new ArrayList<V>();
        elements.forEach(element -> result.addAll(mapper.apply(element)));
        return result;
    }

    private <E, V extends Persistable<ID>, ID> MetaInfo<E, V> generateMetaElementMap(
            List<E> possibleElements,
            List<V> existingElements,
            BiFunction<E, V, V> mapper,
            Function<V, E> inverseMapper) {
        val existingElementByMappedValue = existingElements
                .stream()
                .collect(Collectors.toMap(
                        inverseMapper,
                        element -> element,
                        (u, v) -> {
                            throw new IllegalStateException(String.format("Duplicate key %s in toMap", u));
                        },
                        LinkedHashMap::new));

        val metaElementMap = new LinkedHashMap<E, V>();

        possibleElements.forEach(possibleElement -> {
            metaElementMap.put(
                    possibleElement,
                    mapper.apply(
                            possibleElement,
                            existingElementByMappedValue.get(possibleElement)));

            existingElementByMappedValue.remove(possibleElement);
        });

        return new MetaInfo<>(
                metaElementMap,
                metaElementMap
                        .values()
                        .stream()
                        .filter(Persistable::isNew)
                        .collect(Collectors.toList()),
                existingElementByMappedValue.values());
    }

    private <T extends Collection> void resetCollectionProperty(
            T collection,
            Consumer<T> propertySetter,
            Supplier<T> emptyCollectionSupplier) {
        if (collection != null) {
            collection.clear();
        } else {
            propertySetter.accept(emptyCollectionSupplier.get());
        }
    }

    private <E, ID> void saveNewElements(Collection<E> elements, JpaRepository<E, ID> repository) {
        if (!elements.isEmpty()) {
            repository.saveAll(elements);
        }
    }

    private <K, V, C extends Collection<V>> Map<K, C> groupBy(
            Collection<V> collection, Function<V, K> keyExtractor, Supplier<C> collectionFactory) {
        return collection
                .stream()
                .collect(Collectors.groupingBy(keyExtractor, Collectors.toCollection(collectionFactory)));
    }

}
