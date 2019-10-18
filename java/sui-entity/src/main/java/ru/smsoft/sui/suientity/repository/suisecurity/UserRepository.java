package ru.smsoft.sui.suientity.repository.suisecurity;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.suisecurity.User;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  @Override
  @EntityGraph(value = User.WITH_ROLES)
  @NonNull
  Optional<User> findById(@NonNull Long id);

  @EntityGraph(value = User.WITH_ROLES)
  Optional<User> findByUsernameOrEmail(String username, String email);

  Boolean existsByUsername(String username);

  Boolean existsByEmail(String email);

  Boolean existsByUsernameAndIdNot(String username, Long id);

  Boolean existsByEmailAndIdNot(String email, Long id);

}
