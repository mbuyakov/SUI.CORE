package ru.smsoft.sui.suientity.repository.suimeta;

import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;

import java.util.Map;
import java.util.Optional;

public interface SuiMetaSettingRepository {

    String get(String settingKey);
    Map<String, String> get(Iterable<String> settingKeys);

    Optional<TableInfo> getRestrictionTable();

}
