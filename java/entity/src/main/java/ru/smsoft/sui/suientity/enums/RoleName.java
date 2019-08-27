package ru.smsoft.sui.suientity.enums;

public enum RoleName {

    ROLE_USER,
    ROLE_ADMIN,
    ROLE_TEST,
    ROLE_TABLE_SETTINGS,
    ROLE_ASSIGNEE,
    ROLE_OTHERS;

    public static RoleName getEnumValue(String roleName) {
        try {
            return RoleName.valueOf(roleName);
        } catch (IllegalArgumentException exception) {
            return RoleName.ROLE_OTHERS;
        }
    }

}
