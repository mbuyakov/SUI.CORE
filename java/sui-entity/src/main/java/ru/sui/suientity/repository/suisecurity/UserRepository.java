package ru.sui.suientity.repository.suisecurity;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import ru.sui.suientity.entity.suisecurity.User;

import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    @Override
    @EntityGraph(value = User.WITH_ROLES)
    @NonNull
    Optional<User> findById(@NonNull Long id);

    @EntityGraph(value = User.WITH_ROLES)
    Optional<User> findByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);

}
