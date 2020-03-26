SELECT *
FROM (
    SELECT tc.table_schema AS column_table_schema,
           tc.table_name AS column_table_name,
           kcu.column_name,
           ccu.table_schema AS foreign_column_table_schema,
           ccu.table_name AS foreign_column_table_name,
           ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
        INNER JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        INNER JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
                   AND tc.table_schema = ccu.constraint_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    UNION
    SELECT t2.*
    FROM (
        SELECT t1.table_schema AS column_table_schema,
               t1.table_name AS column_table_name,
               t1.column_name,
               t1.ref_info[1] AS foreign_column_table_schema,
               t1.ref_info[2] AS foreign_column_table_name,
               t1.ref_info[3] AS foreign_column_name
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
        ) t1
    ) t2
        INNER JOIN information_schema.columns c -- Exclude nonexistent
            ON t2.foreign_column_table_schema = c.table_schema
                   AND t2.foreign_column_table_name = c.table_name
                   AND t2.foreign_column_name = c.column_name
) t3
WHERE column_table_schema IN (%s) AND foreign_column_table_schema IN (%1$s);
