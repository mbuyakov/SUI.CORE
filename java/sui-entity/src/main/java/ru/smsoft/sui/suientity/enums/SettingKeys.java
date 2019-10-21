package ru.smsoft.sui.suientity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SettingKeys {

    RESTRICTION_TABLE("restriction_table"),
    USER_RESTRICTION_TABLE("user_restriction_table"),
    RESTRICTION_COLUMN("restriction_column");

    private String value;

}
