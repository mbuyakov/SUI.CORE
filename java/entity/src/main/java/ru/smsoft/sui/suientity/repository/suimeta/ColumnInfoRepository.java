package ru.smsoft.sui.suientity.repository.suimeta;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.suimeta.ColumnInfo;

import java.util.List;

@Repository
public interface ColumnInfoRepository extends JpaRepository<ColumnInfo, Long> {

    @EntityGraph(
            value = ColumnInfo.FULL_SCHEMA,
            type = EntityGraph.EntityGraphType.LOAD)
    List<ColumnInfo> findWithRelationsByIdIn(List<Long> ids);

    List<ColumnInfo> findByTableInfoIdIn(List<Long> ids);

    @EntityGraph(
            value = ColumnInfo.FULL_SCHEMA,
            type = EntityGraph.EntityGraphType.LOAD)
    List<ColumnInfo> findWithRelationsByTableInfoTableName(String name);

    @EntityGraph(
            value = ColumnInfo.FULL_SCHEMA,
            type = EntityGraph.EntityGraphType.LOAD)
    @Query("SELECT columnInfo FROM ColumnInfo columnInfo WHERE columnInfo.tableInfo.id IN :ids")
    List<ColumnInfo> findWithRelationsByTableInfoIdIn(@Param("ids") List<Long> ids);

}