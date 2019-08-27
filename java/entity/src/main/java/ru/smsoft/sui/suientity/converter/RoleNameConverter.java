package ru.smsoft.sui.suientity.converter;

import ru.smsoft.sui.suientity.enums.RoleName;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter
public class RoleNameConverter implements AttributeConverter<RoleName, String> {

    @Override
    public String convertToDatabaseColumn(RoleName roleName) {
        if (roleName == RoleName.ROLE_OTHERS) {
            throw new IllegalArgumentException("Unsupported RoleName: " + roleName.name());
        } else {
            return roleName.name();
        }
    }

    @Override
    public RoleName convertToEntityAttribute(String dbData) {
        return RoleName.getEnumValue(dbData);
    }
}
