SELECT table_schema,
       table_name,
       column_name,
       column_default,
       (udt_name::REGTYPE)::TEXT AS column_type,
       (is_nullable = 'YES') AS is_nullable
FROM information_schema.columns
WHERE table_schema IN (%s)
ORDER BY ordinal_position;
