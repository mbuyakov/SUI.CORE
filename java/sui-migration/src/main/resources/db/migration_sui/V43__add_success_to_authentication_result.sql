ALTER TABLE log.authentication_result ADD success BOOLEAN;

UPDATE log.authentication_result SET success = code IN ('success login', 'success logout (command)', 'success logout (timeout)', 'success logout (by admin)');

ALTER TABLE log.authentication_result ALTER COLUMN success SET NOT NULL;

COMMENT ON COLUMN log.authentication_result.success IS 'Успех';