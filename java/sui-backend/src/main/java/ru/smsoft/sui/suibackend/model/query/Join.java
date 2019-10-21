package ru.smsoft.sui.suibackend.model.query;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Optional;

@AllArgsConstructor
@Getter
@Setter
public class Join {

    private JoinType joinType;
    private TableSegment joinSegment;
    private Condition condition;

    @Override
    public String toString() {
        return String.format(
                "%s %s %s ON %s",
                joinType.getStatement(),
                joinSegment.getStatement(),
                Optional.ofNullable(joinSegment.getAlias()).orElse(""),
                condition);
    }

}
