package ru.smsoft.sui.suientity.repository.suimeta;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.suimeta.ColumnInfoReference;

@Repository
public interface ColumnInfoReferenceRepository extends JpaRepository<ColumnInfoReference, Long> {

}
