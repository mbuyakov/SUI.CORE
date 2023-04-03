ALTER TABLE sui_security.users ALTER COLUMN created type timestamptz using created::timestamptz;
ALTER TABLE sui_security.users ALTER COLUMN updated type timestamptz using updated::timestamptz;