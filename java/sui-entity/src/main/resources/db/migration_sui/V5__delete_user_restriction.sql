DROP TRIGGER IF EXISTS tr_restriction_table_reference ON sui_meta.sui_settings_kv;
DROP FUNCTION IF EXISTS sui_meta.update_restriction_table_reference();
DROP FUNCTION IF EXISTS sui_meta.find_column_info_id(TEXT, TEXT);
DROP FUNCTION IF EXISTS sui_meta.find_column_info_id(TEXT, TEXT, TEXT);
DROP TABLE IF EXISTS sui_security.user_restriction;
