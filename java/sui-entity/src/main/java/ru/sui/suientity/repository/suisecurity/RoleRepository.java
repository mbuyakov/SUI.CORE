package ru.sui.suientity.repository.suisecurity;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.sui.suientity.entity.suisecurity.Role;
import ru.sui.suientity.enums.RoleName;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

  @EntityGraph(Role.WITH_USERS)
  Optional<Role> findWithUsersByRoleName(RoleName roleName);

  @EntityGraph(Role.WITH_USERS)
  Optional<Role> findWithUsersByName(String name);

  Optional<Role> findByName(String name);

}
