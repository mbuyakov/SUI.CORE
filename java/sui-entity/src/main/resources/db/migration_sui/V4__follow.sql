-- DROP TRIGGER IF EXISTS tr_restriction_table_reference ON sui_meta.sui_settings_kv;
-- DROP FUNCTION IF EXISTS sui_meta.update_restriction_table_reference();
-- DROP FUNCTION IF EXISTS sui_meta.find_column_info_id(TEXT, TEXT);
-- DROP FUNCTION IF EXISTS sui_meta.find_column_info_id(TEXT, TEXT, TEXT);
-- DROP TABLE IF EXISTS sui_security.user_restriction;
-- DROP TABLE IF EXISTS sui_meta.sui_settings_kv;
-- ALTER TABLE sui_meta.table_info DROP COLUMN IF EXISTS follow_column_info_id;


ALTER TABLE sui_meta.table_info ADD follow_column_info_id BIGINT REFERENCES sui_meta.column_info(id);

CREATE TABLE sui_meta.sui_settings_kv
(
	id BIGSERIAL PRIMARY KEY,
	key TEXT UNIQUE NOT NULL,
	value TEXT NOT NULL
);

CREATE TABLE sui_security.user_restriction
(
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES sui_security.users(id),
    restriction_id BIGINT
);

CREATE FUNCTION sui_meta.find_column_info_id(
    __schema_name TEXT,
    __table_name TEXT,
    __column_name TEXT
)
    RETURNS BIGINT
    LANGUAGE plpgsql
AS
$$
    DECLARE
        result BIGINT;
    BEGIN
        SELECT column_info.id
        FROM sui_meta.column_info
        INNER JOIN sui_meta.table_info ON column_info.table_info_id = table_info.id
        WHERE schema_name = __schema_name
            AND table_name = __table_name
            AND column_name = __column_name
        INTO result;

        RETURN result;
    END;
$$;

CREATE FUNCTION sui_meta.find_column_info_id(
    __full_table_name TEXT,
    __column_name TEXT
)
    RETURNS BIGINT
    LANGUAGE plpgsql
AS
$$
    DECLARE
        splitted_full_table_name TEXT[];
    BEGIN
        splitted_full_table_name = regexp_split_to_array(__full_table_name, '\.');
        RETURN sui_meta.find_column_info_id(
            splitted_full_table_name[1],
            splitted_full_table_name[2],
            __column_name
        );
    END;
$$;

CREATE FUNCTION sui_meta.update_restriction_table_reference()
    RETURNS TRIGGER
    SECURITY DEFINER
    LANGUAGE plpgsql
AS
$$
    DECLARE
        restriction_table_key CONSTANT TEXT = 'restriction_table';
        old_restriction_table TEXT;
        restriction_column_info_id BIGINT;
        new_foreign_column_info_id BIGINT;
        old_column_info_reference_id BIGINT;
    BEGIN
        IF (NEW.key = restriction_table_key) THEN
            -- SELECT OLD KEY
            SELECT value
            FROM sui_meta.sui_settings_kv
            WHERE key = restriction_table_key
            INTO old_restriction_table;

            -- DROP OLD CONSTRAINT
            ALTER TABLE sui_security.user_restriction
                DROP CONSTRAINT IF EXISTS user_restriction_restriction_id_fk;

            -- ADD NEW CONSTRAINT
            EXECUTE format(
                ' ALTER TABLE sui_security.user_restriction'
                ' ADD CONSTRAINT user_restriction_restriction_id_fk'
                ' FOREIGN KEY (restriction_id) REFERENCES %s(id)',
                NEW.value
            );

            -- UPDATE META SCHEMA (CREATE OR DELETE)
            restriction_column_info_id = sui_meta.find_column_info_id('sui_security.user_restriction','restriction_id');
            new_foreign_column_info_id = sui_meta.find_column_info_id(NEW.value, 'id');

            IF (restriction_column_info_id IS NOT NULL) THEN
                SELECT id
                FROM sui_meta.column_info_reference
                WHERE column_info_id = restriction_column_info_id
                  AND foreign_column_info_id = sui_meta.find_column_info_id(old_restriction_table, 'id')
                INTO old_column_info_reference_id;

                IF (old_column_info_reference_id IS NOT NULL) THEN
                    IF (new_foreign_column_info_id IS NOT NULL) THEN
                        UPDATE sui_meta.column_info_reference
                        SET foreign_column_info_id = new_foreign_column_info_id
                        WHERE id = old_column_info_reference_id;
                    ELSE
                        DELETE FROM sui_meta.column_info_reference WHERE id = old_column_info_reference_id;
                    END IF;
                ELSE
                    IF (new_foreign_column_info_id IS NOT NULL) THEN
                        INSERT INTO sui_meta.column_info_reference(column_info_id, foreign_column_info_id)
                        VALUES (restriction_column_info_id, new_foreign_column_info_id);
                    END IF;
                END IF;
            END IF;
        END IF;

        RETURN NEW;
    END;
$$;

CREATE TRIGGER tr_restriction_table_reference
BEFORE INSERT OR UPDATE
ON sui_meta.sui_settings_kv
FOR EACH ROW
EXECUTE PROCEDURE sui_meta.update_restriction_table_reference();
