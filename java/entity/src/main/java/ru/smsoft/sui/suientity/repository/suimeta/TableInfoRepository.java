package ru.smsoft.sui.suientity.repository.suimeta;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;
import ru.smsoft.sui.suientity.repository.custom.suimeta.CustomTableInfoRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableInfoRepository extends JpaRepository<TableInfo, Long>, CustomTableInfoRepository {

    @EntityGraph(
            value = TableInfo.WITH_COLUMN_INFOS_AND_REFERENCES,
            type = EntityGraph.EntityGraphType.FETCH)
    @Query("SELECT tableInfo FROM TableInfo tableInfo")
    List<TableInfo> findAllWithColumnInfoAndReferences();

    @EntityGraph(
            value = TableInfo.FULL_SCHEMA,
            type = EntityGraph.EntityGraphType.FETCH)
    @Query("SELECT tableInfo FROM TableInfo tableInfo WHERE tableInfo.id = :id")
    Optional<TableInfo> findByIdWithColumnInfoAndRolesAndReferencesAndSubtotalTypesAndFilterTypes(@Param("id") Long id);

}