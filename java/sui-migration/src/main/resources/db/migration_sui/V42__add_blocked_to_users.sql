ALTER TABLE sui_security.users ADD blocked BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN sui_security.users.blocked IS 'Пользователь заблокирован';
