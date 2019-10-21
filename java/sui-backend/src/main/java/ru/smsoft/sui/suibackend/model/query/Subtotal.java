package ru.smsoft.sui.suibackend.model.query;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Subtotal {

    private String columnName;

    private String operation; // i.e. SUM, AVG
}
