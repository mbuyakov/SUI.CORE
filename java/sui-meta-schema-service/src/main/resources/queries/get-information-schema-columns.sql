SELECT table_schema,
       table_name,
       column_name,
       column_default,
       (udt_name::REGTYPE)::TEXT AS column_type,
       (is_nullable = 'YES') AS is_nullable
FROM information_schema.columns
WHERE table_schema != 'pg_catalog' AND table_schema != 'information_schema'
ORDER BY ordinal_position;