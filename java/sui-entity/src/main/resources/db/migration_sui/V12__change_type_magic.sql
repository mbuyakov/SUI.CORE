CREATE TABLE ____tmp____ (
    id BIGSERIAL PRIMARY KEY,
    create_statement TEXT NOT NULL,
    drop_statement TEXT NOT NULL
);

CREATE TABLE ____tmp____comments (
    id BIGSERIAL PRIMARY KEY,
    comment TEXT NOT NULL
);

WITH full_column_info AS (
    SELECT schema_name,
           table_name,
           column_name,
           column_info.id AS column_info_id
    FROM sui_meta.column_info
    INNER JOIN sui_meta.table_info ON column_info.table_info_id = table_info.id
)
INSERT INTO ____tmp____comments(comment)
SELECT format(
    'COMMENT ON COLUMN %s.%s.%s IS ''@references %s.%s(%s)'';',
    t1.table_schema,
    t1.table_name,
    t1.column_name,
    t1.ref_info[1],
    t1.ref_info[2],
    t1.ref_info[3]
)
FROM (
    SELECT pg_namespace.nspname AS table_schema,
           pg_class.relname AS table_name,
           pg_attribute.attname AS column_name,
           regexp_matches(pg_description.description, '@references (.+?)\.(.+?)\((.+?)\)', 'i') AS ref_info
    FROM pg_catalog.pg_class
        INNER JOIN pg_catalog.pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        INNER JOIN pg_catalog.pg_attribute ON pg_class.oid = pg_attribute.attrelid
        INNER JOIN pg_catalog.pg_description
            ON (pg_attribute.attrelid = pg_description.objoid AND pg_attribute.attnum = pg_description.objsubid)
    WHERE pg_class.relkind IN ('r', 'm', 'v')
        AND NOT pg_attribute.attisdropped
        AND pg_attribute.attnum >= 1
        AND pg_description.description ILIKE '%%@references%%'
) t1;

CREATE FUNCTION ____WTF____()
    RETURNS VOID
    LANGUAGE plpgsql
AS
$$
    DECLARE
        total_views INTEGER;
        iterations INTEGER := 0;
        create_statement TEXT;
        drop_statement TEXT;
        ____tmp____id TEXT;
        processed BIGINT[] = ARRAY[]::BIGINT[];
        comment TEXT;
    BEGIN
        SELECT COUNT(*)
        FROM pg_catalog.pg_views
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        INTO total_views;

        INSERT INTO ____tmp____(drop_statement, create_statement)
        SELECT format('DROP VIEW %s.%s', schemaname, viewname) drop_statement,
               format('CREATE VIEW %s.%s AS' || E'\n', schemaname, viewname) || definition AS create_statement
        FROM pg_catalog.pg_views
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema');

        WHILE (iterations < (10 * total_views)) AND EXISTS(SELECT * FROM ____tmp____ WHERE id NOT IN (SELECT unnest(processed))) LOOP
            iterations := iterations + 1;

            FOR ____tmp____id, drop_statement IN (SELECT id, ____tmp____.drop_statement FROM ____tmp____ WHERE id NOT IN (SELECT unnest(processed))) LOOP
                BEGIN
                    EXECUTE drop_statement;

                    processed := processed || (____tmp____id::BIGINT);
                EXCEPTION
                    WHEN others THEN iterations := iterations;
                END;
            END LOOP;
        END LOOP;

        ALTER TABLE sui_security.users ALTER COLUMN username SET DATA TYPE VARCHAR(60);

        FOR create_statement IN (
            SELECT ____tmp____.create_statement
            FROM (
                SELECT id,
                       row_number() OVER() AS rank
                FROM unnest(processed) id
            ) t
            INNER JOIN ____tmp____ USING(id)
            ORDER BY rank DESC
        ) LOOP
            EXECUTE create_statement;
        END LOOP;

        FOR comment IN ( SELECT ____tmp____comments.comment FROM ____tmp____comments) LOOP
            EXECUTE comment;
        END LOOP;
    END;
$$;

SELECT ____WTF____();

DROP TABLE ____tmp____;
DROP TABLE ____tmp____comments;
DROP FUNCTION ____WTF____();
