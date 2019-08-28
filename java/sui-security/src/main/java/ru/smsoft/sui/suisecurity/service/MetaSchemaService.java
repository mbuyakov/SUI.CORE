package ru.smsoft.sui.suisecurity.service;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Service;
import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;
import ru.smsoft.sui.suientity.repository.suimeta.TableInfoRepository;
import ru.smsoft.sui.suisecurity.utils.TimeCache;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
@EnableScheduling
public class MetaSchemaService {

    private static final long CACHE_ACTUAL_TIME = 2500;

    private TimeCache<String, Optional<TableInfo>> tableInfoByCamelCaseTableNameCache =
            new TimeCache<>(CACHE_ACTUAL_TIME);

    @NonNull
    private TableInfoRepository tableInfoRepository;

    public @Nullable TableInfo getTableInfo(Long id) {
        return tableInfoRepository
                .findByIdWithColumnInfoAndRolesAndReferencesAndSubtotalTypesAndFilterTypes(id)
                .orElse(null);
    }

    public @Nullable TableInfo getTableInfoByCamelCaseTableName(String camelCaseTableName) {
        return tableInfoByCamelCaseTableNameCache
                .get(camelCaseTableName, () -> tableInfoRepository.findByCamelCaseTableName(camelCaseTableName))
                .orElse(null);
    }

}
