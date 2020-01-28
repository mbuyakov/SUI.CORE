CREATE TABLE ____tmp____ (
    id BIGSERIAL PRIMARY KEY,
    create_statement TEXT NOT NULL,
    drop_statement TEXT NOT NULL
);

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
    END;
$$;

SELECT ____WTF____();

DROP TABLE ____tmp____;
DROP FUNCTION ____WTF____();
