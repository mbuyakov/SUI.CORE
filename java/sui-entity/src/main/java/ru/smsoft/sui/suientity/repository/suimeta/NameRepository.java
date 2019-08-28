package ru.smsoft.sui.suientity.repository.suimeta;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.smsoft.sui.suientity.entity.suimeta.Name;

import java.util.Optional;

@Repository
public interface NameRepository extends JpaRepository<Name, Long> {

    Optional<Name> findByName(String name);
}