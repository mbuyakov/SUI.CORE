CREATE OR REPLACE FUNCTION public.__meta()
    RETURNS TEXT
    LANGUAGE plpgsql
AS $$
    DECLARE
        result TEXT;
    BEGIN
        WITH insert_tables AS (
            SELECT 'name' AS table_name, NULL AS columns
            UNION ALL
            SELECT 'table_info',
                   (
                       SELECT array_agg(column_name)
                       FROM information_schema.columns
                       WHERE table_schema = 'sui_meta'
                            AND table_name = 'table_info'
                            AND column_name NOT IN ('foreign_link_column_info_id', 'link_column_info_id', 'follow_column_info_id')
                   )
            UNION ALL
            SELECT 'column_info', NULL
            UNION ALL
            SELECT 'column_info_reference', NULL
            UNION ALL
            SELECT 'column_info_role', NULL
        ), meta_tables AS (
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'sui_meta'
        )
        SELECT string_agg(section, E'\n\n\n')
        FROM (
            SELECT 'BEGIN;' AS section
            UNION ALL
            SELECT string_agg(format('DROP TRIGGER IF EXISTS populate_audit_columns_trigger ON sui_meta.%s;', table_name), E'\n' ORDER BY table_name)
            FROM meta_tables
            UNION ALL
            SELECT string_agg(format('DROP TRIGGER IF EXISTS audit_log_trigger ON sui_meta.%s;', table_name), E'\n' ORDER BY table_name)
            FROM meta_tables
            UNION ALL
            SELECT 'ALTER TABLE log.audit_log DROP CONSTRAINT audit_log_table_info_id_fkey;'
            UNION ALL
            SELECT 'ALTER TABLE log.table_export_log DROP CONSTRAINT table_export_log_table_info_id_fkey;'
            UNION ALL
            SELECT 'ALTER TABLE sui_meta.user_settings DROP CONSTRAINT user_settings_table_info_id_fkey;'
            UNION ALL
            SELECT string_agg(format('DELETE FROM sui_meta.%s;', table_name), E'\n')
            FROM (VALUES ('table_info'), ('name')) t (table_name)
            UNION ALL
            SELECT t.*
            FROM (
                SELECT public.__dump('sui_meta', table_name, columns)
                FROM insert_tables
                ORDER BY table_name
            ) t
            UNION ALL
            SELECT string_agg(format('UPDATE sui_meta.table_info SET %s = %s WHERE id = %s;', column_name, column_info_id, id), E'\n')
            FROM (
                SELECT id,
                       foreign_link_column_info_id column_info_id,
                       'foreign_link_column_info_id' AS column_name
                FROM sui_meta.table_info
                WHERE foreign_link_column_info_id IS NOT NULL
                UNION ALL
                SELECT id, link_column_info_id, 'link_column_info_id'
                FROM sui_meta.table_info
                WHERE link_column_info_id IS NOT NULL
                UNION ALL
                SELECT id, follow_column_info_id, 'follow_column_info_id'
                FROM sui_meta.table_info
                WHERE follow_column_info_id IS NOT NULL
                ORDER BY id, column_name, column_info_id
            ) t
            UNION ALL
            SELECT string_agg(
                format('SELECT setval(%s, %s, true);', quote_literal(t.schemaname || '.' || t.sequencename), pg_sequences.last_value),
                E'\n'
            )
            FROM (
                SELECT 'sui_meta' AS schemaname,
                       format('%s_id_seq', table_name) AS sequencename
                FROM insert_tables
                ORDER BY table_name
            ) t
            INNER JOIN pg_sequences USING(schemaname, sequencename)
            WHERE last_value IS NOT NULL
            UNION ALL
            SELECT string_agg(
                'CREATE TRIGGER audit_log_trigger'
                    || ' BEFORE UPDATE OR DELETE OR INSERT ON sui_meta.' || table_name
                    || ' FOR EACH ROW'
                    || ' EXECUTE PROCEDURE log.audit_table_modification();',
                E'\n'
                ORDER BY table_name
            )
            FROM meta_tables
            UNION ALL
            SELECT string_agg(
                'CREATE TRIGGER populate_audit_columns_trigger'
                    || ' BEFORE UPDATE OR DELETE OR INSERT ON sui_meta.' || table_name
                    || ' FOR EACH ROW'
                    || ' EXECUTE PROCEDURE log.populate_audit_columns();',
                E'\n'
                ORDER BY table_name
            )
            FROM meta_tables
            UNION ALL
            SELECT 'ALTER TABLE log.audit_log ADD CONSTRAINT audit_log_table_info_id_fkey FOREIGN KEY (table_info_id) REFERENCES sui_meta.table_info ON DELETE CASCADE;'
            UNION ALL
            SELECT 'ALTER TABLE log.table_export_log ADD CONSTRAINT table_export_log_table_info_id_fkey FOREIGN KEY (table_info_id) REFERENCES sui_meta.table_info ON DELETE CASCADE;'
            UNION ALL
            SELECT 'ALTER TABLE sui_meta.user_settings ADD CONSTRAINT user_settings_table_info_id_fkey FOREIGN KEY (table_info_id) REFERENCES sui_meta.table_info ON DELETE CASCADE;'
            UNION ALL
            SELECT string_agg(command, E'\n')
            FROM (
                 VALUES ('CREATE FUNCTION ____clear_audit_triggers()'),
                        ('    RETURNS VOID'),
                        ('    LANGUAGE plpgsql'),
                        ('AS $' || '$'),
                        ('    DECLARE'),
                        ('        audited TEXT[];'),
                        ('        table_name TEXT;'),
                        ('    BEGIN'),
                        ('        SELECT array_agg(DISTINCT event_object_schema || ''.'' || event_object_table)'),
                        ('        FROM information_schema.triggers'),
                        ('        WHERE trigger_name = ''audit_log_trigger'''),
                        ('        INTO audited;'),
                        (''),
                        ('        FOR table_name IN (SELECT * FROM unnest(audited)) LOOP'),
                        ('            EXECUTE ''DROP TRIGGER IF EXISTS audit_log_trigger ON '' || table_name;'),
                        ('        END LOOP;'),
                        ('    END;'),
                        ('$' || '$;')
            ) t(command)
            UNION ALL
            SELECT 'SELECT ____clear_audit_triggers();'
            UNION ALL
            SELECT 'DROP FUNCTION ____clear_audit_triggers();'
            UNION ALL
            SELECT 'SELECT log.start_audit_table(id) FROM sui_meta.table_info WHERE is_audited = TRUE;'
            UNION ALL
            SELECT 'COMMIT;'
        ) res INTO result;

        RETURN result;
    END;
$$;
