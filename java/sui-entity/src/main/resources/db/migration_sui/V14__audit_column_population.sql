CREATE OR REPLACE FUNCTION sui_security.get_current_user_id()
    RETURNS BIGINT
    LANGUAGE plpgsql
AS
$$
    BEGIN
        RETURN NULLIF(current_setting('user.id', true), '')::BIGINT;
    END;
$$;

ALTER TABLE log.audit_log ALTER COLUMN content SET DATA TYPE JSONB USING content::JSONB;
ALTER TABLE log.meta_audit_log ALTER COLUMN content SET DATA TYPE JSONB USING content::JSONB;

CREATE FUNCTION sui_utils.jsonb_unidirectional_difference(first JSONB, second JSONB)
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
                ELSEIF (first_field_value != second_field_value) THEN
                    result := result || jsonb_build_object(field, first_field_value);
                END IF;
            END LOOP;
        END IF;

        RETURN NULLIF(result, '{}');
    END;
$$;

CREATE FUNCTION sui_utils.jsonb_difference(
    first JSONB,
    second JSONB,
    first_result_key TEXT DEFAULT 'first',
    second_result_key TEXT DEFAULT 'second'
)
    RETURNS JSONB
    LANGUAGE plpgsql
AS $$
    BEGIN
        RETURN jsonb_build_object(
            first_result_key,
            sui_utils.jsonb_unidirectional_difference(first, second),
            second_result_key,
            sui_utils.jsonb_unidirectional_difference(second, first)
        );
    END;
$$;

CREATE FUNCTION sui_meta.get_table_info_by_oid(table_oid OID)
    RETURNS sui_meta.table_info
    LANGUAGE plpgsql
AS
$$
    DECLARE
        result sui_meta.table_info;
    BEGIN
        SELECT table_info.*
        FROM (
            SELECT nspname AS schema_name,
                   relname AS table_name
            FROM pg_catalog.pg_class cl
            INNER JOIN pg_catalog.pg_namespace nsp ON cl.relnamespace = nsp.oid
            WHERE cl.oid = table_oid
        ) table_def
        INNER JOIN sui_meta.table_info USING (schema_name, table_name)
        INTO result;

        IF result.id IS NULL THEN
            RAISE EXCEPTION 'Не удалось найти table_info по table_oid = %', table_oid;
        ELSE
            RETURN result;
        END IF;
    END;
$$;

CREATE OR REPLACE FUNCTION log.audit_table_modification()
    RETURNS TRIGGER
    SECURITY DEFINER
    LANGUAGE plpgsql
AS
$$
    DECLARE
        table_info sui_meta.table_info;
        audit_log_table_name TEXT;
        audit_query       TEXT;
        update_difference JSON;
    BEGIN
        table_info := sui_meta.get_table_info_by_oid(TG_RELID);

        audit_log_table_name := CASE WHEN lower(table_info.schema_name) = 'sui_meta' THEN 'meta_audit_log' ELSE 'audit_log' END;

        audit_query := concat(
            'INSERT INTO log.' || audit_log_table_name || '(',
                'table_info_id, operation_type, user_id, db_user, row_id, content',
            ') VALUES (',
                concat_ws(
                    ', ', -- separator
                    table_info.id,
                    '$1',
                    'sui_security.get_current_user_id()',
                    'current_user',
                    '$2.id::TEXT',
                    '$3'
                ),
            ')'
        );

        IF (TG_OP = 'DELETE') THEN
            EXECUTE audit_query USING TG_OP, OLD, to_jsonb(OLD);

            RETURN OLD;
        ELSIF (TG_OP = 'UPDATE') THEN
            update_difference := sui_utils.jsonb_difference(to_jsonb(OLD), to_jsonb(NEW), 'old', 'new');

            IF (update_difference->>'old' IS NOT NULL OR update_difference->>'new' IS NOT NULL) THEN
                EXECUTE audit_query USING TG_OP, OLD, update_difference;
            END IF;

            RETURN NEW;
        ELSIF (TG_OP = 'INSERT') THEN
            EXECUTE audit_query USING TG_OP, NEW, to_jsonb(NEW);

            RETURN NEW;
        END IF;
    END;
$$;

CREATE FUNCTION log.populate_audit_columns()
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

        SELECT array_agg(column_name)
        FROM information_schema.columns
        WHERE columns.table_schema = table_info.schema_name
          AND columns.table_name = table_info.table_name
        INTO columns;

        IF TG_OP = 'INSERT' THEN
            IF 'create_user_id' = ANY(columns) THEN
                field_patch := field_patch || jsonb_build_object('create_user_id', sui_security.get_current_user_id());
            END IF;
        ELSE -- TG_OP = 'UPDATE'
            IF (ARRAY['change_user_id', 'modified', 'delete_date'] && columns) THEN
                update_delta := sui_utils.jsonb_difference(to_jsonb(OLD), to_jsonb(NEW), 'old', 'new');

                -- IF modified
                IF (update_delta->>'old' IS NOT NULL OR update_delta->>'new' IS NOT NULL) THEN
                    IF 'change_user_id' = ANY(columns) THEN
                        field_patch := field_patch || jsonb_build_object('change_user_id', sui_security.get_current_user_id());
                    END IF;

                    IF 'modified' = ANY(columns) THEN
                        field_patch := field_patch || jsonb_build_object('modified', now());
                    END IF;

                    IF 'deleted' = ANY(columns) AND 'delete_date' = ANY(columns) THEN
                        IF ((update_delta->'old'->>'deleted')::BOOLEAN IS FALSE AND (update_delta->'new'->>'deleted')::BOOLEAN IS TRUE ) THEN
                            field_patch := field_patch || jsonb_build_object('delete_date', now());
                        END IF;
                    END IF;
                END IF;
            END IF;
        END IF;

        RETURN json_populate_record(NEW, field_patch::JSON);
    END;
$$;

CREATE OR REPLACE FUNCTION log.start_audit_table(table_info_id bigint)
    RETURNS VOID
    LANGUAGE plpgsql
AS
$$
    DECLARE
        table_oid BIGINT;
    BEGIN
        SELECT sui_meta.get_table_info_oid(table_info_id) INTO table_oid;

        IF table_oid IS NULL THEN
            RAISE EXCEPTION 'Не удалось идентифицировать таблицу с table_info_id = %', table_info_id;
        END IF;

        IF sui_utils.get_schema_name_from_oid(table_oid) = 'log' THEN
            RAISE EXCEPTION 'Невозможно вести аудит данной таблицы';
        END IF;

        -- DELETE OLD TRIGGERS
        EXECUTE 'DROP TRIGGER IF EXISTS audit_log_trigger ON ' || table_oid::regclass::text || ';';
        EXECUTE 'DROP TRIGGER IF EXISTS populate_audit_columns_trigger ON ' || table_oid::regclass::text || ';';

        -- CREATE NEW TRIGGERS
        EXECUTE concat(
            'CREATE TRIGGER audit_log_trigger',
            ' BEFORE UPDATE OR DELETE OR INSERT',
            ' ON ' || table_oid::regclass::text,
            ' FOR EACH ROW',
            ' EXECUTE PROCEDURE log.audit_table_modification();'
        );
        EXECUTE concat(
            'CREATE TRIGGER populate_audit_columns_trigger',
            ' BEFORE UPDATE OR INSERT',
            ' ON ' || table_oid::regclass::text,
            ' FOR EACH ROW',
            ' EXECUTE PROCEDURE log.populate_audit_columns();'
        );

        UPDATE sui_meta.table_info SET is_audited = TRUE WHERE id = table_info_id;
    END;
$$;

CREATE OR REPLACE FUNCTION log.stop_audit_table(table_info_id bigint)
    RETURNS VOID
    LANGUAGE plpgsql
AS
$$
    DECLARE
        table_oid BIGINT;
    BEGIN
        SELECT sui_meta.get_table_info_oid(table_info_id) INTO table_oid;

        IF table_oid IS NULL THEN
            RAISE EXCEPTION 'Не удалось идентифицировать таблицу с table_info_id = %', table_info_id;
        END IF;

        IF sui_utils.get_schema_name_from_oid(table_oid) = 'sui_meta' THEN
            RAISE EXCEPTION 'Аудит метасхемы отключить нельзя';
        END IF;

        EXECUTE 'DROP TRIGGER IF EXISTS audit_log_trigger ON ' || table_oid::regclass::text || ';';
        EXECUTE 'DROP TRIGGER IF EXISTS populate_audit_columns_trigger ON ' || table_oid::regclass::text || ';';

        UPDATE sui_meta.table_info SET is_audited = false WHERE id = table_info_id;
    END;
$$;
