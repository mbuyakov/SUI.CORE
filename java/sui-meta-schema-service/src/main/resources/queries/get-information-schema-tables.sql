SELECT pg_namespace.nspname AS table_schema,
       pg_class.relname AS table_name,
       CASE
           WHEN relkind = 'r' THEN 'BASE TABLE'
           WHEN relkind = 'v' THEN 'VIEW'
           WHEN relkind = 'm' THEN 'MATERIALIZED VIEW'
           END AS table_type
FROM pg_catalog.pg_class
     INNER JOIN pg_catalog.pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE pg_class.relkind IN ('r', 'm', 'v')
  AND pg_namespace.nspname IN (%s)
