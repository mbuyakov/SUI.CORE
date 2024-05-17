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

        IF NOT EXISTS(SELECT 1 FROM sui_meta.sui_settings_kv WHERE key = 'disable_populate_audit_columns_trigger' AND value = 'true') THEN
             EXECUTE concat(
                 'CREATE TRIGGER populate_audit_columns_trigger',
                 ' BEFORE UPDATE OR INSERT',
                 ' ON ' || table_oid::regclass::text,
                 ' FOR EACH ROW',
                 ' EXECUTE PROCEDURE log.populate_audit_columns();'
             );
        END IF;

        UPDATE sui_meta.table_info SET is_audited = TRUE WHERE id = table_info_id;
    END;
$$;