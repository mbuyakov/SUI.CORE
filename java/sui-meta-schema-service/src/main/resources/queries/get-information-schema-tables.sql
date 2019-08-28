SELECT table_schema, table_name, table_type
FROM information_schema.tables
WHERE table_schema != 'pg_catalog' AND table_schema != 'information_schema';