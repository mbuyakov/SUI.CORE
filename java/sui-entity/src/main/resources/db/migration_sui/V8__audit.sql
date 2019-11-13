CREATE SCHEMA sui_utils;

CREATE FUNCTION sui_utils.json_difference(
    first_json JSON,
    second_json JSON,
    first_result_key TEXT DEFAULT 'first'::TEXT,
    second_result_key TEXT DEFAULT 'second'::TEXT
)
    RETURNS JSON
    LANGUAGE plpgsql
AS
$$
    DECLARE
        first_result  JSON;
        second_result JSON;
    BEGIN
        WITH json_difference AS (
            SELECT first.key    AS first_key,
                   first.value  AS first_value,
                   second.key   AS second_key,
                   second.value AS second_value
            FROM json_each(first_json) first
                     FULL JOIN json_each(second_json) second
                               ON first.key = second.key
            WHERE first.key IS NULL
               OR second.key IS NULL
               OR (first.value::TEXT != second.value::TEXT)
        )

        SELECT first.result, second.result
        FROM (
            SELECT json_object_agg(first_key, first_value) AS result
            FROM json_difference
            WHERE first_key IS NOT NULL
        ) first, (
            SELECT json_object_agg(second_key, second_value) AS result
            FROM json_difference
            WHERE second_key IS NOT NULL
        ) second
        INTO first_result, second_result;

        RETURN json_build_object(
                first_result_key,
                first_result,
                second_result_key,
                second_result
        );
    END;
$$;

CREATE FUNCTION sui_utils.get_schema_name_from_oid(param_oid bigint)
    RETURNS text
    LANGUAGE plpgsql
AS
$$
    DECLARE
        schema_name TEXT;
    BEGIN
        SELECT relnamespace::regnamespace::TEXT
        FROM pg_catalog.pg_class
        WHERE oid = param_oid
        INTO schema_name;

        RETURN schema_name;
    END;
$$;

CREATE SCHEMA log;

CREATE TABLE log.audit_log
(
    id             BIGSERIAL PRIMARY KEY,
    table_info_id  BIGINT                  NOT NULL REFERENCES sui_meta.table_info (id) ON DELETE CASCADE,
    operation_type VARCHAR(32)             NOT NULL,
    row_id         TEXT,
    user_id        BIGINT REFERENCES sui_security.users (id),
    content        JSON,
    created        TIMESTAMP DEFAULT now() NOT NULL,
    db_user        VARCHAR(64)             NOT NULL
);

CREATE TABLE log.meta_audit_log
(
    id             BIGSERIAL PRIMARY KEY,
    table_info_id  BIGINT                  NOT NULL REFERENCES sui_meta.table_info (id) ON DELETE CASCADE,
    operation_type VARCHAR(32)             NOT NULL,
    row_id         TEXT,
    user_id        BIGINT REFERENCES sui_security.users (id),
    content        JSON,
    created        TIMESTAMP DEFAULT now() NOT NULL,
    db_user        VARCHAR(64)             NOT NULL,
    processed      BOOLEAN   DEFAULT FALSE NOT NULL
);

CREATE FUNCTION log.start_audit_table(table_info_id bigint)
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

        -- DELETE OLD TRIGGER
        EXECUTE 'DROP TRIGGER IF EXISTS audit_log_trigger ON ' || table_oid::regclass::text || ';';

        -- CREATE NEW TRIGGER
        EXECUTE concat(
            'CREATE TRIGGER audit_log_trigger',
            ' BEFORE UPDATE OR DELETE OR INSERT',
            ' ON ' || table_oid::regclass::text,
            ' FOR EACH ROW',
            ' EXECUTE PROCEDURE log.audit_table_modification();'
        );

        UPDATE sui_meta.table_info SET is_audited = TRUE WHERE id = table_info_id;
    END;
$$;

CREATE FUNCTION log.stop_audit_table(table_info_id bigint)
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

        UPDATE sui_meta.table_info SET is_audited = false WHERE id = table_info_id;
    END;
$$;

CREATE FUNCTION log.audit_table_modification()
    RETURNS TRIGGER
    SECURITY DEFINER
    LANGUAGE plpgsql
AS
$$
    DECLARE
        audit_log_table_name TEXT;
        schema_name TEXT;
        query       TEXT;
        table_info_id BIGINT;
        update_difference JSON;
    BEGIN
        SELECT table_def.schema_name, ti.id
        FROM (
            SELECT nspname AS schema_name, relname AS table_name
            FROM pg_catalog.pg_class cl
            INNER JOIN pg_catalog.pg_namespace nsp ON (cl.relnamespace = nsp.oid)
            WHERE cl.oid = TG_RELID
        ) table_def
        INNER JOIN sui_meta.table_info ti
            ON (ti.schema_name = table_def.schema_name AND ti.table_name = table_def.table_name)
        INTO schema_name, table_info_id;

        IF (table_info_id IS NULL) THEN
            RAISE EXCEPTION 'Не удалось найти table_info по TG_RELID = %', TG_RELID;
        END IF;

        audit_log_table_name := CASE WHEN lower(schema_name) = 'sui_meta' THEN 'meta_audit_log' ELSE 'audit_log' END;

        query = concat(
            'INSERT INTO log.' || audit_log_table_name || '(',
                'table_info_id, operation_type, user_id, db_user, row_id, content',
            ') VALUES (',
                concat_ws(
                    ', ', -- separator
                    table_info_id,
                    '$1',
                    '(SELECT CASE WHEN u.id = '''' THEN NULL ELSE u.id::BIGINT END FROM (SELECT current_setting(''user.id'', true) AS id) u)',
                    'current_user',
                    '$2.id::TEXT',
                    '$3'
                ),
            ')'
        );

        IF (TG_OP = 'DELETE') THEN
            EXECUTE query USING TG_OP, OLD, row_to_json(OLD);
            RETURN OLD;
        ELSIF (TG_OP = 'UPDATE') THEN
            update_difference := sui_utils.json_difference(row_to_json(OLD), row_to_json(NEW), 'old', 'new');
            IF (update_difference->>'old' IS NOT NULL OR update_difference->>'new' IS NOT NULL) THEN
                EXECUTE query
                    USING TG_OP, OLD, update_difference;
            END IF;
            RETURN NEW;
        ELSIF (TG_OP = 'INSERT') THEN
            EXECUTE query USING TG_OP, NEW, row_to_json(NEW);
            RETURN NEW;
        END IF;
    END;
$$;
