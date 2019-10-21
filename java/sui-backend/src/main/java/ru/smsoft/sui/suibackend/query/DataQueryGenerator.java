package ru.smsoft.sui.suibackend.query;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.smsoft.sui.suibackend.message.model.Sorting;
import ru.smsoft.sui.suibackend.utils.QueryUtils;

import java.util.Collection;
import java.util.Collections;
import java.util.Optional;

import static ru.smsoft.sui.suibackend.utils.Constants.FROM_WITH_NAME;

@Service
@Slf4j
public class DataQueryGenerator {

    public String generateQuery(
            String fromWith,
            String whereCondition,
            Collection<Sorting> sorts,
            Long limit,
            Long offset) {
        return QueryUtils.generateResultQuery(
                Collections.singletonMap(FROM_WITH_NAME, fromWith),
                Collections.singletonList(
                        "SELECT * FROM " +
                                FROM_WITH_NAME +
                                Optional.ofNullable(whereCondition).map(condition -> " WHERE " + condition).orElse("") +
                                QueryUtils.generateSortCondition(sorts, limit, offset)));
    }
}
