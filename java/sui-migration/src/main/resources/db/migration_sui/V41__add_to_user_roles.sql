ALTER TABLE sui_security.user_roles
DROP CONSTRAINT user_roles_pkey;

ALTER TABLE sui_security.user_roles
  ADD CONSTRAINT user_roles_user_id_role_id_uindex
    UNIQUE (user_id, role_id);

ALTER TABLE sui_security.user_roles ADD id BIGSERIAL NOT NULL PRIMARY KEY;
