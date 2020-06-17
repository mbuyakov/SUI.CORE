package ru.sui.suientity.repository.log;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.sui.suientity.entity.log.AuditLog;


@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

}
