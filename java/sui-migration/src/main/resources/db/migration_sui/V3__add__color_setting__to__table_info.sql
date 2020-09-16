ALTER TABLE sui_meta.table_info DROP COLUMN IF EXISTS color_settings;
ALTER TABLE sui_meta.table_info ADD color_settings JSON;
