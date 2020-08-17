CREATE TABLE sui_meta.column_info_dependence
(
    id                 BIGSERIAL PRIMARY KEY,
    -- I.E. ui.child_ui.bti_rayon_id
    column_info_id     BIGINT NOT NULL REFERENCES sui_meta.column_info (id) ON DELETE CASCADE,
    -- I.E. ui.child_ui.district_id
    depends_on_column_info_id BIGINT NOT NULL REFERENCES sui_meta.column_info (id) ON DELETE CASCADE,
    -- I.E. address.bti_rayon.district_id
    catalog_column_info_id BIGINT NOT NULL REFERENCES sui_meta.column_info (id) ON DELETE CASCADE
);
