CREATE TABLE log.table_export_log (
    id BIGSERIAL PRIMARY KEY,
    table_info_id BIGINT NOT NULL REFERENCES sui_meta.table_info(id),
    user_id BIGINT NOT NULL REFERENCES sui_security.users(id),
    ts TIMESTAMP NOT NULL DEFAULT now(),
    row_count BIGINT NOT NULL
);
