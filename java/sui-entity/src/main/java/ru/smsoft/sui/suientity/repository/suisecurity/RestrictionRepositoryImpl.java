package ru.smsoft.sui.suientity.repository.suisecurity;

import lombok.val;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.suisecurity.User;
import ru.smsoft.sui.suientity.enums.SettingKeys;
import ru.smsoft.sui.suientity.repository.suimeta.SuiMetaSettingRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Repository
public class RestrictionRepositoryImpl implements RestrictionRepository {

  @Autowired
  private SuiMetaSettingRepository settingRepository;
  @Autowired
  private JdbcTemplate jdbcTemplate;

  @Override
  public <T> List<T> findRestrictions(User user, Class<T> tClass) {
      val restrictionTableKey = SettingKeys.USER_RESTRICTION_TABLE.getValue();
      val restrictionColumnKey = SettingKeys.RESTRICTION_COLUMN.getValue();
      val settings = settingRepository.get(Arrays.asList(restrictionTableKey, restrictionColumnKey));

      if (settings.values().stream().noneMatch(Objects::isNull)) {
          return jdbcTemplate.queryForList(
              String.format("SELECT %s FROM %s WHERE user_id = " + user.getId(),
                  settings.get(restrictionColumnKey),
                  settings.get(restrictionTableKey)),
              tClass);
      } else {
          throw new RuntimeException("One or more restriction setting param is null: " + settings);
      }
  }

}
