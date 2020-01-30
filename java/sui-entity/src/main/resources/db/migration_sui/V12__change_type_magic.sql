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
    schema_name,
    table_name,
    column_name,
    foreign_schema_name,
    foreign_table_name,
    foreign_column_name
)
FROM (
    SELECT fci1.schema_name,
           fci1.table_name,
           fci1.column_name,
           fci2.schema_name AS foreign_schema_name,
           fci2.table_name AS foreign_table_name,
           fci2.column_name AS foreign_column_name
    FROM sui_meta.column_info_reference
    INNER JOIN full_column_info fci1 ON column_info_reference.column_info_id = fci1.column_info_id
    INNER JOIN full_column_info fci2 ON column_info_reference.foreign_column_info_id = fci2.column_info_id
    EXCEPT
    SELECT tc.table_schema,
           tc.table_name,
           kcu.column_name,
           ccu.table_schema,
           ccu.table_name,
           ccu.column_name
    FROM information_schema.table_constraints AS tc
        INNER JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        INNER JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
                   AND tc.table_schema = ccu.constraint_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
) t;

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
