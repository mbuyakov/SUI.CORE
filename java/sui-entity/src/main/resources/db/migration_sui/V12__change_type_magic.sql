UPDATE pg_attribute SET atttypmod = 64 WHERE attname = 'username' AND attrelid = 'sui_security.users'::regclass;
