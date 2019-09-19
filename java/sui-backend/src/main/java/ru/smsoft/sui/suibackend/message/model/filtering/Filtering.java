package ru.smsoft.sui.suibackend.message.model.filtering;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringType;

@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class Filtering {

    private FilteringType type;
}
