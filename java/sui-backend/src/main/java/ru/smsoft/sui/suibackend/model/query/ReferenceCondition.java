package ru.smsoft.sui.suibackend.model.query;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor
@Getter
@Builder
public class ReferenceCondition implements Condition {

    private final TableSegment fromTable;
    private final TableSegment toTable;
    private final String referencedColumnName;

    @Override
    public String toString() {
        return String.format("%s.%s = %s.id", fromTable, referencedColumnName, toTable);
    }

}
