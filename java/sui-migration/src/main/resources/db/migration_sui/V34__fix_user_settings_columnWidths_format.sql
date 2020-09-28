UPDATE sui_meta.user_settings
SET content = (user_settings.content::JSONB || jsonb_build_object('columnWidths', t2.width_settings))::JSON
FROM (
    SELECT t.id,
           jsonb_agg(width_info::JSONB || jsonb_build_object('metaWidth', COALESCE(column_info.width, 200))) AS width_settings
    FROM (
        SELECT user_settings.id,
               table_info_id,
               json_array_elements(content->'columnWidths') AS width_info
        FROM sui_meta.user_settings
    ) t
    LEFT JOIN sui_meta.column_info
        ON (t.table_info_id = column_info.table_info_id AND t.width_info->>'columnName' = column_info.column_name)
    GROUP BY t.id
) t2
WHERE t2.id = user_settings.id;
