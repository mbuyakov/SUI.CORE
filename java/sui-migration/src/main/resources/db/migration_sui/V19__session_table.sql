CREATE TABLE sui_security.session(
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sui_security.users(id),
    active BOOLEAN NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    last_user_activity TIMESTAMP NOT NULL,
    disabling_date TIMESTAMP
);
