package ru.sui.suientity.repository.log;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.sui.suientity.entity.log.TableExportLog;


@Repository
public interface TableExportLogRepository extends JpaRepository<TableExportLog, Long> {

}
