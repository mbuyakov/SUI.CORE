SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE SCHEMA sui_meta;


CREATE SCHEMA sui_security;

CREATE FUNCTION sui_meta.check_unused_name(name_id bigint) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
  BEGIN
	DELETE FROM sui_meta.name WHERE id = name_id;

	IF NOT FOUND THEN
        RETURN FALSE;
     END IF;

    RAISE SQLSTATE 'MYERR';

    EXCEPTION
        WHEN foreign_key_violation THEN RETURN  FALSE;
        WHEN SQLSTATE 'MYERR' THEN RETURN TRUE;
  END;
$$;


CREATE FUNCTION sui_meta.get_table_info_oid(table_info_id bigint) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
    result BIGINT;
BEGIN
    SELECT pg_class.oid
    FROM pg_catalog.pg_class
    INNER JOIN pg_catalog.pg_namespace nsp ON (pg_class.relnamespace = nsp.oid)
    INNER JOIN (
        SELECT schema_name, table_name
        FROM sui_meta.table_info
        WHERE id = table_info_id
    ) table_info ON (table_info.schema_name = nsp.nspname AND table_info.table_name = pg_class.relname)
    INTO result;
    RETURN result;
END;
$$;


CREATE FUNCTION sui_meta.set_roles_to_table_info(updated_table character varying, role_ids bigint[] DEFAULT NULL::bigint[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    column_info_ids BIGINT[];
BEGIN
    SELECT array_agg(ci.id)
    FROM sui_meta.column_info ci
             INNER JOIN sui_meta.table_info ti ON ci.table_info_id = ti.id
    WHERE ti.table_name = updated_table
    INTO column_info_ids;

    INSERT INTO sui_meta.column_info_role(column_info_id, role_id)

    SELECT column_info_id, r.id AS role_id
    FROM unnest(column_info_ids) column_info_id,
         (SELECT id FROM sui_security.roles WHERE role_ids IS NULL OR id = ANY (role_ids)) r
    EXCEPT
    SELECT column_info_id, role_id
    FROM sui_meta.column_info_role;
END;
$$;


SET default_tablespace = '';

SET default_with_oids = false;

CREATE TABLE sui_meta.column_info (
    id bigint NOT NULL,
    table_info_id bigint NOT NULL,
    column_name character varying(250) NOT NULL,
    name_id bigint,
    visible boolean DEFAULT false NOT NULL,
    default_visible boolean DEFAULT false NOT NULL,
    width integer DEFAULT 200,
    column_type character varying,
    default_value text,
    is_nullable boolean DEFAULT false NOT NULL,
    "order" integer,
    table_render_params json,
    default_grouping boolean DEFAULT false NOT NULL,
    default_sorting character varying,
    subtotal_type_id bigint,
    filter_type_id bigint
);


CREATE SEQUENCE sui_meta.column_info_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_meta.column_info_id_seq OWNED BY sui_meta.column_info.id;


CREATE TABLE sui_meta.column_info_reference (
    id bigint NOT NULL,
    column_info_id bigint NOT NULL,
    foreign_column_info_id bigint NOT NULL
);


CREATE SEQUENCE sui_meta.column_info_reference_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_meta.column_info_reference_id_seq OWNED BY sui_meta.column_info_reference.id;


CREATE TABLE sui_meta.column_info_role (
    id bigint NOT NULL,
    column_info_id bigint,
    role_id bigint NOT NULL
);


CREATE SEQUENCE sui_meta.column_info_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_meta.column_info_role_id_seq OWNED BY sui_meta.column_info_role.id;


CREATE TABLE sui_meta.column_info_tag (
    id bigint NOT NULL,
    column_info_id bigint NOT NULL,
    tag_id bigint NOT NULL
);


CREATE SEQUENCE sui_meta.column_info_tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_meta.column_info_tag_id_seq OWNED BY sui_meta.column_info_tag.id;


CREATE TABLE sui_meta.engine (
    id bigint NOT NULL,
    name character varying(100)
);


CREATE SEQUENCE sui_meta.engine_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_meta.engine_id_seq OWNED BY sui_meta.engine.id;


CREATE TABLE sui_meta.filter_type (
    id bigint NOT NULL,
    type character varying(32) NOT NULL,
    name character varying(32) NOT NULL
);


CREATE SEQUENCE sui_meta.filter_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_meta.filter_type_id_seq OWNED BY sui_meta.filter_type.id;


CREATE TABLE sui_meta.name (
    id bigint NOT NULL,
    name character varying(250),
    description text
);


CREATE SEQUENCE sui_meta.name_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_meta.name_id_seq OWNED BY sui_meta.name.id;


CREATE TABLE sui_meta.subtotal_type (
    id bigint NOT NULL,
    name character varying NOT NULL,
    expression character varying NOT NULL
);


CREATE SEQUENCE sui_meta.subtotal_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_meta.subtotal_type_id_seq OWNED BY sui_meta.subtotal_type.id;


CREATE SEQUENCE sui_meta.table_info_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE sui_meta.table_info (
    id bigint DEFAULT nextval('sui_meta.table_info_id_seq'::regclass) NOT NULL,
    engine_id bigint NOT NULL,
    table_name character varying(250) NOT NULL,
    schema_name character varying(250),
    name_id bigint,
    link_column_info_id bigint,
    foreign_link_column_info_id bigint,
    card_render_params json,
    is_catalog boolean DEFAULT false NOT NULL,
    is_audited boolean DEFAULT false NOT NULL,
    type character varying(64)
);


CREATE TABLE sui_meta.tag (
    id bigint NOT NULL,
    code text NOT NULL,
    name text NOT NULL
);


CREATE SEQUENCE sui_meta.tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_meta.tag_id_seq OWNED BY sui_meta.tag.id;


CREATE TABLE sui_security.roles (
    id bigint NOT NULL,
    name character varying(60) NOT NULL
);


CREATE SEQUENCE sui_security.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_security.roles_id_seq OWNED BY sui_security.roles.id;


CREATE TABLE sui_security.user_roles (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL
);


CREATE TABLE sui_security.users (
    id bigint NOT NULL,
    name character varying(60) NOT NULL,
    username character varying(25) NOT NULL,
    email character varying(60) NOT NULL,
    password character varying(100) NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL,
    updated timestamp without time zone DEFAULT now(),
    deleted boolean DEFAULT false NOT NULL
);


CREATE SEQUENCE sui_security.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE sui_security.users_id_seq OWNED BY sui_security.users.id;


ALTER TABLE ONLY sui_meta.column_info ALTER COLUMN id SET DEFAULT nextval('sui_meta.column_info_id_seq'::regclass);


ALTER TABLE ONLY sui_meta.column_info_reference ALTER COLUMN id SET DEFAULT nextval('sui_meta.column_info_reference_id_seq'::regclass);


ALTER TABLE ONLY sui_meta.column_info_role ALTER COLUMN id SET DEFAULT nextval('sui_meta.column_info_role_id_seq'::regclass);


ALTER TABLE ONLY sui_meta.column_info_tag ALTER COLUMN id SET DEFAULT nextval('sui_meta.column_info_tag_id_seq'::regclass);


ALTER TABLE ONLY sui_meta.engine ALTER COLUMN id SET DEFAULT nextval('sui_meta.engine_id_seq'::regclass);


ALTER TABLE ONLY sui_meta.filter_type ALTER COLUMN id SET DEFAULT nextval('sui_meta.filter_type_id_seq'::regclass);


ALTER TABLE ONLY sui_meta.name ALTER COLUMN id SET DEFAULT nextval('sui_meta.name_id_seq'::regclass);


ALTER TABLE ONLY sui_meta.subtotal_type ALTER COLUMN id SET DEFAULT nextval('sui_meta.subtotal_type_id_seq'::regclass);


ALTER TABLE ONLY sui_meta.tag ALTER COLUMN id SET DEFAULT nextval('sui_meta.tag_id_seq'::regclass);


ALTER TABLE ONLY sui_security.roles ALTER COLUMN id SET DEFAULT nextval('sui_security.roles_id_seq'::regclass);


ALTER TABLE ONLY sui_security.users ALTER COLUMN id SET DEFAULT nextval('sui_security.users_id_seq'::regclass)


COPY sui_meta.engine (id, name) FROM stdin;
 1	PostgreSQL
 2	Заглушка
\.


SELECT pg_catalog.setval('sui_meta.engine_id_seq', 2, true);


COPY sui_meta.filter_type (id, type, name) FROM stdin;
 1	boolean	Логический
 2	date	Дата
 3	datetime	Дата и время
\.


SELECT pg_catalog.setval('sui_meta.filter_type_id_seq', 3, true);


COPY sui_meta.subtotal_type (id, name, expression) FROM stdin;
1	Максимум	MAX
2	Минимум	MIN
3	Среднее	AVG
4	Всего	SUM
\.


SELECT pg_catalog.setval('sui_meta.subtotal_type_id_seq', 4, true);


COPY sui_security.roles (id, name) FROM stdin;
1	ROLE_USER
2	ROLE_ADMIN
\.


SELECT pg_catalog.setval('sui_security.roles_id_seq', 2, true);


COPY sui_security.user_roles (user_id, role_id) FROM stdin;
1	1
1	2
\.


COPY sui_security.users (id, name, username, email, password, created, updated, deleted) FROM stdin;
1	Администратор	admin	test@woyd.ru	$2a$10$6imcIcpsQcjgJvhBTHUNEutkB.cnEHCedAIgxtJK5ZU.B0Pp3ijP.	2019-09-08 11:24:35.216719	2019-09-08 11:24:35.216719	f
\.


SELECT pg_catalog.setval('sui_security.users_id_seq', 1, true);


ALTER TABLE ONLY sui_meta.column_info
    ADD CONSTRAINT column_info_pk PRIMARY KEY (id);


ALTER TABLE ONLY sui_meta.column_info_reference
    ADD CONSTRAINT column_info_reference_pk PRIMARY KEY (id);


ALTER TABLE ONLY sui_meta.column_info_role
    ADD CONSTRAINT column_info_role_pk PRIMARY KEY (id);


ALTER TABLE ONLY sui_meta.column_info_tag
    ADD CONSTRAINT column_info_tag_pkey PRIMARY KEY (id);


ALTER TABLE ONLY sui_meta.engine
    ADD CONSTRAINT engine_pk PRIMARY KEY (id);


ALTER TABLE ONLY sui_meta.filter_type
    ADD CONSTRAINT filter_type_pk PRIMARY KEY (id);


ALTER TABLE ONLY sui_meta.name
    ADD CONSTRAINT name_pk PRIMARY KEY (id);


ALTER TABLE ONLY sui_meta.subtotal_type
    ADD CONSTRAINT subtotal_type_pkey PRIMARY KEY (id);


ALTER TABLE ONLY sui_meta.table_info
    ADD CONSTRAINT table_info_pk PRIMARY KEY (id);


ALTER TABLE ONLY sui_meta.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


ALTER TABLE ONLY sui_security.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


ALTER TABLE ONLY sui_security.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


ALTER TABLE ONLY sui_security.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


ALTER TABLE ONLY sui_security.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


ALTER TABLE ONLY sui_security.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


ALTER TABLE ONLY sui_security.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


CREATE UNIQUE INDEX column_info_reference_column_info_id_foreign_column_info_id_uin ON sui_meta.column_info_reference USING btree (column_info_id, foreign_column_info_id);


CREATE UNIQUE INDEX column_info_role_column_info_id_role_id_uindex ON sui_meta.column_info_role USING btree (column_info_id, role_id);


CREATE UNIQUE INDEX column_info_table_info_id_column_name_uindex ON sui_meta.column_info USING btree (table_info_id, column_name);


CREATE UNIQUE INDEX column_info_tag_pk ON sui_meta.column_info_tag USING btree (id);


CREATE UNIQUE INDEX engine_name_uindex ON sui_meta.engine USING btree (name);


CREATE UNIQUE INDEX name_name_uindex ON sui_meta.name USING btree (name);


CREATE UNIQUE INDEX table_info_schema_name_table_name_uindex ON sui_meta.table_info USING btree (schema_name, table_name);


ALTER TABLE ONLY sui_meta.column_info
    ADD CONSTRAINT column_info_filter_type_id_fk FOREIGN KEY (filter_type_id) REFERENCES sui_meta.filter_type(id);


ALTER TABLE ONLY sui_meta.column_info
    ADD CONSTRAINT "column_info_meta.name_id_fk" FOREIGN KEY (name_id) REFERENCES sui_meta.name(id);


ALTER TABLE ONLY sui_meta.column_info
    ADD CONSTRAINT "column_info_meta.table_info_id_fk" FOREIGN KEY (table_info_id) REFERENCES sui_meta.table_info(id) ON DELETE CASCADE;


ALTER TABLE ONLY sui_meta.column_info_reference
    ADD CONSTRAINT column_info_reference_column_info_id_fk FOREIGN KEY (column_info_id) REFERENCES sui_meta.column_info(id) ON DELETE CASCADE;


ALTER TABLE ONLY sui_meta.column_info_reference
    ADD CONSTRAINT column_info_reference_column_info_id_fk_2 FOREIGN KEY (foreign_column_info_id) REFERENCES sui_meta.column_info(id) ON DELETE CASCADE;


ALTER TABLE ONLY sui_meta.column_info_role
    ADD CONSTRAINT column_info_role_column_info_id_fk FOREIGN KEY (column_info_id) REFERENCES sui_meta.column_info(id) ON DELETE CASCADE;


ALTER TABLE ONLY sui_meta.column_info_role
    ADD CONSTRAINT column_info_role_roles_id_fk FOREIGN KEY (role_id) REFERENCES sui_security.roles(id) ON DELETE CASCADE;


ALTER TABLE ONLY sui_meta.column_info
    ADD CONSTRAINT column_info_subtotal_type_id_fk FOREIGN KEY (subtotal_type_id) REFERENCES sui_meta.subtotal_type(id);


ALTER TABLE ONLY sui_meta.column_info_tag
    ADD CONSTRAINT column_info_tag_column_info_id_fk FOREIGN KEY (column_info_id) REFERENCES sui_meta.column_info(id) ON DELETE CASCADE;


ALTER TABLE ONLY sui_meta.column_info_tag
    ADD CONSTRAINT column_info_tag_tag_id_fk FOREIGN KEY (tag_id) REFERENCES sui_meta.tag(id) ON DELETE CASCADE;


ALTER TABLE ONLY sui_meta.table_info
    ADD CONSTRAINT table_info_column_info_id_fk FOREIGN KEY (link_column_info_id) REFERENCES sui_meta.column_info(id);


ALTER TABLE ONLY sui_meta.table_info
    ADD CONSTRAINT table_info_column_info_id_fk_2 FOREIGN KEY (foreign_link_column_info_id) REFERENCES sui_meta.column_info(id);


ALTER TABLE ONLY sui_meta.table_info
    ADD CONSTRAINT "table_info_meta.engine_id_fk" FOREIGN KEY (engine_id) REFERENCES sui_meta.engine(id) ON DELETE CASCADE;


ALTER TABLE ONLY sui_meta.table_info
    ADD CONSTRAINT table_info_name_id_fk FOREIGN KEY (name_id) REFERENCES sui_meta.name(id);


ALTER TABLE ONLY sui_security.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES sui_security.roles(id);


ALTER TABLE ONLY sui_security.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES sui_security.users(id);
