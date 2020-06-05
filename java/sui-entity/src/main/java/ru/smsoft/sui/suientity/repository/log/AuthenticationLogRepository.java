package ru.smsoft.sui.suientity.repository.log;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.log.AuthenticationLog;
import ru.smsoft.sui.suientity.entity.suisecurity.User;
import ru.smsoft.sui.suientity.enums.AuthenticationOperation;

import java.util.Date;
import java.util.List;


@Repository
public interface AuthenticationLogRepository extends JpaRepository<AuthenticationLog, Long> {

    Long countByOperationAndRemoteAddressAndFormLoginAndCreatedIsGreaterThanEqual(
            AuthenticationOperation operation,
            String remoteAddress,
            String formLogin,
            Date from
    );

    List<AuthenticationLog> findTop2ByUserOrderByCreatedDesc(User user);

}
