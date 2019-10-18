package ru.smsoft.sui.suientity.repository.suisecurity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import ru.smsoft.sui.suientity.entity.suisecurity.User;

import java.util.List;

public class RestrictionRepositoryImpl implements RestrictionRepository {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @Override
  public <T> List<T> findRestrictions(User user, Class<T> tClass) {
    return jdbcTemplate.queryForList(
      "SELECT restriction_id FROM sui_security.user_restriction WHERE user_id = " + user.getId(),
      tClass);
  }

}
