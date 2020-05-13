package ru.smsoft.sui.suientity.repository.log;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.log.AuthenticationResult;

import java.util.Optional;


@Repository
public interface AuthenticationResultRepository extends JpaRepository<AuthenticationResult, Long> {

    Optional<AuthenticationResult> findByCode(String code);

}
