ALTER TABLE sui_security.session RENAME client_info TO remote_address;

ALTER TABLE log.authentication_log ADD remote_address TEXT;

CREATE INDEX ON log.authentication_log(operation, remote_address, form_login);
