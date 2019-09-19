package ru.smsoft.sui.suibackend.jackson;

import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsonorg.PackageVersion;
import org.postgresql.jdbc.PgArray;
import org.postgresql.util.PGobject;
import ru.smsoft.sui.suibackend.message.model.filtering.Filtering;

import java.sql.Date;
import java.sql.Timestamp;

public class BackendJacksonModule extends SimpleModule {

    private static final long serialVersionUID = 1;

    private final static String NAME = "BackendJacksonModule";

    public BackendJacksonModule() {
        super(NAME, PackageVersion.VERSION);
        // Serializers
        addSerializer(Timestamp.class, new ToStringSerializer<>());
        addSerializer(Date.class, new ToStringSerializer<>());
        addSerializer(PGobject.class, new ToStringSerializer<>());
        addSerializer(PgArray.class, new PgArraySerializer());

        // Deserializers
        addDeserializer(Filtering.class, new FilteringDeserializer());
    }

}
