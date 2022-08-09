CREATE OR REPLACE FUNCTION log.populate_audit_columns()
    RETURNS TRIGGER
    SECURITY DEFINER
    LANGUAGE plpgsql
AS
$$
    DECLARE
        table_info sui_meta.table_info;
        columns TEXT[];
        field_patch JSONB = '{}'::JSONB;
        update_delta JSONB;
    BEGIN
        table_info := sui_meta.get_table_info_by_oid(TG_RELID);

        SELECT array_agg(column_name::TEXT)
        FROM information_schema.columns
        WHERE columns.table_schema = table_info.schema_name
          AND columns.table_name = table_info.table_name
        INTO columns;

        -- Set change_user_id for INSERT AND UPDATE
        IF 'change_user_id' = ANY(columns) THEN
            field_patch := field_patch || jsonb_build_object('change_user_id', sui_security.get_current_user_id());
        END IF;

        IF TG_OP = 'INSERT' THEN
            IF 'create_user_id' = ANY(columns) THEN
                field_patch := field_patch || jsonb_build_object('create_user_id', sui_security.get_current_user_id());
            END IF;
        ELSE -- TG_OP = 'UPDATE'
            IF (ARRAY['modified', 'delete_date'] && columns) THEN
                update_delta := sui_utils.jsonb_difference(to_jsonb(OLD), to_jsonb(NEW), 'old', 'new');

                -- IF modified
                IF (update_delta->>'old' IS NOT NULL OR update_delta->>'new' IS NOT NULL) THEN
                    IF 'modified' = ANY(columns) THEN
                        field_patch := field_patch || jsonb_build_object('modified', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US +00:00'));
                    END IF;

                    IF 'deleted' = ANY(columns) AND 'delete_date' = ANY(columns) THEN
                        IF ((update_delta->'old'->>'deleted')::BOOLEAN IS FALSE AND (update_delta->'new'->>'deleted')::BOOLEAN IS TRUE ) THEN
                            field_patch := field_patch || jsonb_build_object('delete_date', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US +00:00'));
                        END IF;
                    END IF;
                END IF;
            END IF;
        END IF;

        RETURN json_populate_record(NEW, field_patch::JSON);
    END;
$$;
