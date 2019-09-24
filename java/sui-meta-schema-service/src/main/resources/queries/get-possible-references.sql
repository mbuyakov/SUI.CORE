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
                         ON tc.constraint_name = kcu.constraint_name
                             AND tc.table_schema = kcu.table_schema
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
                       SELECT cols.table_schema,
                              cols.table_name,
                              cols.column_name,
                              regexp_matches(descr.description, '@references (.+?)\.(.+?)\((.+?)\)', 'i') AS ref_info
                       FROM pg_catalog.pg_description descr
                                INNER JOIN pg_catalog.pg_class class ON descr.objoid = class.oid
                                INNER JOIN information_schema.columns cols ON (
                                   cols.ordinal_position::int = objsubid
                               AND class.relname=cols.table_name
                           )
                       WHERE classoid = 'pg_catalog.pg_class'::pg_catalog.regclass
                         AND descr.description ILIKE '%%@references%%' -- ILIKE - case-insensitive
                   ) t1
          ) t2
              INNER JOIN information_schema.columns c -- Exclude nonexistent
                         ON t2.foreign_column_table_schema = c.table_schema
                             AND t2.foreign_column_table_name = c.table_name
                             AND t2.foreign_column_name = c.column_name
) t3
WHERE column_table_schema IN (%s)
  AND foreign_column_table_schema IN (%1$s);
