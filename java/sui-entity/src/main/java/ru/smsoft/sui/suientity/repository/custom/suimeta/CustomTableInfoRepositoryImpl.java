package ru.smsoft.sui.suientity.repository.custom.suimeta;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.val;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CustomTableInfoRepositoryImpl implements CustomTableInfoRepository {

    private static final String CAMEL_CASE_FUNCTION = "utils.to_camel_case";
    private static final String FETCH_GRAPH_HINT_NAME = "javax.persistence.fetchgraph";

    @NonNull
    private EntityManager entityManager;

    @Override
    public Optional<TableInfo> findByCamelCaseTableName(String camelCaseTableName) {
        val builder = entityManager.getCriteriaBuilder();
        val query = builder.createQuery(TableInfo.class);
        val root = query.from(TableInfo.class);

        query.where(
                builder.equal(
                        builder.function(
                                CAMEL_CASE_FUNCTION,
                                String.class,
                                root.get("tableName")),
                        builder.literal(camelCaseTableName)));

        TypedQuery<TableInfo> typedQuery =
                entityManager.createQuery(query)
                        .setHint(FETCH_GRAPH_HINT_NAME, entityManager.createEntityGraph(TableInfo.WITH_COLUMN_INFOS_AND_ROLES));

        val resultList = typedQuery.getResultList();

        return Optional
                .ofNullable(resultList)
                .filter(list -> !list.isEmpty())
                .map(list -> list.get(0));
    }

}
