ALTER TABLE sui_security.session ADD created TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE sui_security.session ADD client_info TEXT;
