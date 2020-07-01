package ru.sui.suientity.repository.suimeta;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.sui.suientity.entity.suimeta.TableInfo;
import ru.sui.suientity.repository.custom.suimeta.CustomTableInfoRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableInfoRepository extends JpaRepository<TableInfo, Long>, CustomTableInfoRepository {

  @EntityGraph(
    value = TableInfo.WITH_COLUMN_INFOS_AND_REFERENCES,
    type = EntityGraph.EntityGraphType.FETCH
  )
  @Query("SELECT tableInfo FROM TableInfo tableInfo")
  List<TableInfo> findAllWithColumnInfoAndReferences();

  @EntityGraph(
    value = TableInfo.FULL_SCHEMA,
    type = EntityGraph.EntityGraphType.LOAD
  )
  @Query("SELECT tableInfo FROM TableInfo tableInfo WHERE tableInfo.id = :id")
  @Fetch(FetchMode.JOIN)
  Optional<TableInfo> findByIdWithColumnInfoAndRolesAndReferencesAndSubtotalTypesAndFilterTypes(@Param("id") Long id);

  Optional<TableInfo> findBySchemaNameAndTableName(String schemaName, String tableName);

  @Transactional
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("UPDATE TableInfo tableInfo SET tableInfo.isAudited = :isAudited WHERE tableInfo = :tableInfo")
  void setIsAudited(@Param("tableInfo") TableInfo tableInfo, @Param("isAudited") boolean isAudited);

}
