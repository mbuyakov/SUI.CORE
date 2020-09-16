package ru.sui.suientity.repository.suisecurity;

import org.springframework.data.repository.query.Param;
import ru.sui.suientity.entity.suisecurity.User;

import java.util.List;

public interface RestrictionRepository {

  <T> List<T> findRestrictions(@Param("user") User user, Class<T> tClass);

}
