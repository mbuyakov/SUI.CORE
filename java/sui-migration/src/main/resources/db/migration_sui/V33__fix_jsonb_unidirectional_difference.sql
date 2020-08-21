CREATE OR REPLACE FUNCTION sui_utils.jsonb_unidirectional_difference(first JSONB, second JSONB)
    RETURNS JSONB
    LANGUAGE plpgsql
AS $$
    DECLARE
        result JSONB = '{}'::JSONB;
        object_difference JSONB;
        field TEXT;
        first_field_value JSONB;
        second_field_value JSONB;
    BEGIN
        IF (first IS NOT NULL AND jsonb_typeof(first) != 'null') THEN
            FOR field IN (SELECT element.key FROM jsonb_each(first) element) LOOP
                first_field_value := first->field;
                second_field_value := second->field;

                IF (jsonb_typeof(first_field_value) = 'object' AND jsonb_typeof(second_field_value) = 'object') THEN
                    object_difference := sui_utils.jsonb_unidirectional_difference(first_field_value, second_field_value);

                    IF (object_difference IS NOT NULL) THEN
                        result := result || jsonb_build_object(field, object_difference);
                    END IF;
                ELSEIF (first_field_value IS DISTINCT FROM second_field_value) THEN
                    result := result || jsonb_build_object(field, first_field_value);
                END IF;
            END LOOP;
        END IF;

        RETURN NULLIF(result, '{}');
    END;
$$;
