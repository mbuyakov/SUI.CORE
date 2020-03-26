package ru.smsoft.sui.suibackend.jackson;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import lombok.val;
import org.postgresql.jdbc.PgArray;

import java.io.IOException;
import java.sql.SQLException;

public class PgArraySerializer extends JsonSerializer<PgArray> {

  @Override
  public void serialize(PgArray value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
    try {
      val array = getArray(value);
      if (array != null) {
        val serializer = serializers.findValueSerializer(array.getClass());
        if (serializer != null) {
          serializer.serialize(array, gen, serializers);
        } else {
          throw new IOException("Couldn't find serializer for " + array.getClass());
        }
      } else {
        gen.writeNull();
      }
    } catch (SQLException exception) {
      throw new IOException("Couldn't extract array from PgArray", exception);
    }
  }

  private Object getArray(PgArray value) throws SQLException {
    return (value != null) ? value.getArray() : null;
  }

}
