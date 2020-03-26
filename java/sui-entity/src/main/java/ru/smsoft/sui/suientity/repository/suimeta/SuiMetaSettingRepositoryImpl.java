package ru.smsoft.sui.suientity.repository.suimeta;

import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;
import ru.smsoft.sui.suientity.enums.SettingKeys;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Repository
@Slf4j
public class SuiMetaSettingRepositoryImpl implements SuiMetaSettingRepository {

    @Autowired
    private TableInfoRepository tableInfoRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public String get(String settingKey) {
        return get(Collections.singleton(settingKey)).get(settingKey);
    }

    @Override
    public Map<String, String> get(Iterable<String> settingKeys) {
        val settingKeyList = StreamSupport
                .stream(settingKeys.spliterator(), false)
                .collect(Collectors.toList()) ;

        if (!settingKeyList.isEmpty()) {
            val queryResult = jdbcTemplate.queryForList(
                    String.format(
                            "SELECT key, value FROM sui_meta.sui_settings_kv WHERE key IN (%s)",
                            settingKeyList
                                .stream()
                                .map(key -> String.format("'%s'", key))
                                .collect(Collectors.joining(","))));

            val result = queryResult
                    .stream()
                    .collect(Collectors.toMap(
                        element -> (String) element.get("key"),
                        element -> (String) element.get("value")));

            settingKeyList.forEach(key -> {
                if (!result.containsKey(key)) {
                    result.put(key, null);
                }
            });

            return result;
        }

        return Collections.emptyMap();
    }

    @Override
    public Optional<TableInfo> getRestrictionTable() {
        return Optional
                .ofNullable(get(SettingKeys.RESTRICTION_TABLE.getValue()))
                .flatMap(fullTableName -> {
                    try {
                        val splittedName = fullTableName.split("\\.");
                        return tableInfoRepository.findBySchemaNameAndTableName(splittedName[0], splittedName[1]);
                    } catch (Exception exception) {
                        log.error("Couldn't find table with fullName = " + fullTableName, exception);
                        return Optional.empty();
                    }
                });
    }


}
