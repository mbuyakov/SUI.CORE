CREATE TABLE sui_utils.lock
(
    id        BIGSERIAL PRIMARY KEY,
    group_key TEXT NOT NULL,
    lock_key  TEXT NOT NULL,
    expire_at TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX ON sui_utils.lock(group_key, lock_key);
