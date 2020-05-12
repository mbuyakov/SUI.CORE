CREATE VIEW log.table_export_log_ui AS
    SELECT table_export_log.*,
           table_info.name_id AS table_name_id
    FROM log.table_export_log
    INNER JOIN sui_meta.table_info ON table_export_log.table_info_id = table_info.id;

COMMENT ON COLUMN ui.table_export_log_ui.table_info_id IS '@references sui_meta.table_info(id)';
COMMENT ON COLUMN ui.table_export_log_ui.table_name_id IS '@references sui_meta.name(id)';
COMMENT ON COLUMN ui.table_export_log_ui.user_id IS '@references sui_security.users(id)';
