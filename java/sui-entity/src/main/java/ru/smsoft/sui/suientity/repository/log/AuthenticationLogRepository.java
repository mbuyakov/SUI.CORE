package ru.smsoft.sui.suientity.repository.log;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.log.AuthenticationLog;


@Repository
public interface AuthenticationLogRepository extends JpaRepository<AuthenticationLog, Long> {

}
