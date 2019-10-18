package ru.smsoft.sui.suientity.repository.suimeta;

import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;
import ru.smsoft.sui.suientity.enums.SettingKeys;

import java.util.Optional;

@Repository
@Slf4j
public class SuiMetaSettingRepositoryImpl implements SuiMetaSettingRepository {

    @Autowired
    private TableInfoRepository tableInfoRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public String get(String settingKey) {
        return jdbcTemplate.queryForObject(
            String.format("SELECT value FROM sui_meta.sui_settings_kv WHERE key = '%s'", settingKey),
            String.class);
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
