ALTER TABLE sui_security.roles ADD COLUMN IF NOT EXISTS rus_name VARCHAR(64) NOT NULL DEFAULT ''; -- Чтобы не разрешать роли быть пустой

UPDATE sui_security.roles SET rus_name = 'Пользователь' WHERE name = 'ROLE_USER';
UPDATE sui_security.roles SET rus_name = 'Администратор' WHERE name = 'ROLE_ADMIN';
