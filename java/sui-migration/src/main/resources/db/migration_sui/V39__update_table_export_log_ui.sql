DROP VIEW log.table_export_log_ui;

CREATE VIEW log.table_export_log_ui AS
SELECT table_export_log.*,
       COALESCE(name.name, table_info.table_name) AS table_name
FROM log.table_export_log
INNER JOIN sui_meta.table_info ON table_export_log.table_info_id = table_info.id
LEFT JOIN sui_meta.name ON table_info.name_id = name.id;

COMMENT ON COLUMN log.table_export_log_ui.table_info_id IS '@references sui_meta.table_info(id)';
COMMENT ON COLUMN log.table_export_log_ui.user_id IS '@references sui_security.users(id)';
