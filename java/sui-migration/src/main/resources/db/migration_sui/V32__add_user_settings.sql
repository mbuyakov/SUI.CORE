CREATE TABLE sui_meta.user_settings (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES sui_security.users (id),
    table_info_id BIGINT NOT NULL REFERENCES sui_meta.table_info (id),
    content       JSON NOT NULL,
    CONSTRAINT user_settings_user_id_table_info_id_uindex UNIQUE (user_id, table_info_id)
);

CREATE FUNCTION sui_meta.create_or_update_user_settings(user_id BIGINT, table_info_id BIGINT, content JSON)
    RETURNS VOID
    LANGUAGE plpgsql
AS $$
    BEGIN
        INSERT INTO sui_meta.user_settings(user_id, table_info_id, content)
        VALUES (
            create_or_update_user_settings.user_id,
            create_or_update_user_settings.table_info_id,
            create_or_update_user_settings.content
        )
        ON CONFLICT ON CONSTRAINT user_settings_user_id_table_info_id_uindex DO UPDATE SET content = EXCLUDED.content;
    END;
$$;
