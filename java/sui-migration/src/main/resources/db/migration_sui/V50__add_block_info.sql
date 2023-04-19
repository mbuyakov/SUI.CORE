ALTER TABLE sui_security.users ADD COLUMN unblock_date TIMESTAMPTZ;
ALTER TABLE sui_security.users ADD COLUMN block_reason TEXT;