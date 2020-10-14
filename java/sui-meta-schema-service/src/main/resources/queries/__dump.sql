CREATE OR REPLACE FUNCTION public.__dump(__schema TEXT, __table TEXT, __columns TEXT[] = NULL)
    RETURNS TEXT AS
$$
    DECLARE
        columns            JSON;
        dump_query         TEXT;
        select_query       TEXT;
        values_elements    TEXT[];
    BEGIN
        SELECT json_agg(row_to_json(t))
        FROM (
           SELECT column_name,
                  data_type
           FROM information_schema.columns
           WHERE table_schema = __schema
                AND table_name = __table
                AND (__columns IS NULL OR column_name = ANY(__columns))
           ORDER BY ordinal_position
        ) t
        INTO columns;

        SELECT format(
                    'INSERT INTO %s.%s(%s) VALUES ',
                    __schema,
                    __table,
                    joined_columns),
               format(
                   'SELECT array_agg(format(%s, %s)) AS value FROM %s.%s',
                   quote_literal('(' || column_templates || ')'),
                   values_templates,
                   __schema,
                   __table)
        FROM (
            SELECT string_agg(t3.column_name, ',') AS joined_columns,
                   string_agg('%s', ',') AS column_templates,
                   string_agg(values_template, ',') AS values_templates
            FROM (
                SELECT t2.column_name,
                       format(
                           '(CASE WHEN %s IS NULL THEN %s ELSE (%s) END)',
                           t2.column_name,
                           quote_literal('NULL'),
                           format('quote_literal(%s) || ''::%s''', t2.column_name, t2.data_type)) AS values_template
                FROM (
                    SELECT quote_ident(t1.element->>'column_name') AS column_name,
                           t1.element->>'data_type' AS data_type
                    FROM json_array_elements(columns) AS t1(element)
                ) t2
            ) t3
        ) t4
        INTO dump_query, select_query;

        EXECUTE select_query INTO values_elements;

        RETURN dump_query || E'\n\t' || array_to_string(values_elements, E',\n\t') || E';';
    END;
$$
LANGUAGE plpgsql;
