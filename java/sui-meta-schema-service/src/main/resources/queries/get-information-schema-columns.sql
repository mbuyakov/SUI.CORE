SELECT pg_namespace.nspname AS table_schema,
       pg_class.relname AS table_name,
       pg_attribute.attname AS column_name,
       pg_get_expr(pg_attrdef.adbin, pg_attrdef.adrelid) AS column_default,
       (pg_attribute.atttypid::REGTYPE)::TEXT AS column_type,
       NOT pg_attribute.attnotnull AS is_nullable
FROM pg_catalog.pg_class
         INNER JOIN pg_catalog.pg_namespace ON pg_class.relnamespace = pg_namespace.oid
         INNER JOIN pg_catalog.pg_attribute ON pg_class.oid = pg_attribute.attrelid
         LEFT JOIN pg_catalog.pg_attrdef ON (pg_attribute.attrelid = pg_attrdef.adrelid AND pg_attribute.attnum = pg_attrdef.adnum)
WHERE pg_class.relkind IN ('r', 'm', 'v')
  AND NOT pg_attribute.attisdropped
  AND pg_attribute.attnum >= 1
  AND pg_namespace.nspname IN (%s)
ORDER BY pg_attribute.attnum;
