DROP VIEW log.table_name_ui;

CREATE VIEW log.table_name_ui AS
SELECT id, id AS name FROM (
SELECT DISTINCT COALESCE(name.name, table_info.table_name) AS id
FROM log.table_export_log
         INNER JOIN sui_meta.table_info ON table_export_log.table_info_id = table_info.id
         LEFT JOIN sui_meta.name ON table_info.name_id = name.id) t;

COMMENT ON COLUMN log.table_export_log_ui.table_name IS '@references log.table_name_ui(id)';
