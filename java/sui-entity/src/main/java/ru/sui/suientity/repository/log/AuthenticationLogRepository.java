package ru.sui.suientity.repository.log;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.sui.suientity.entity.log.AuthenticationLog;
import ru.sui.suientity.entity.suisecurity.User;
import ru.sui.suientity.enums.AuthenticationOperation;

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

    List<AuthenticationLog> findAllByOperationAndUser(AuthenticationOperation operation, User user, Pageable pageable);

    List<AuthenticationLog> findTop2ByUserOrderByCreatedDesc(User user);

}
