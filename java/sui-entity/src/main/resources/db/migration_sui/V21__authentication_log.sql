CREATE TABLE log.authentication_result(
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL
);

CREATE UNIQUE INDEX ON log.authentication_result(code);

INSERT INTO log.authentication_result(code, name)
    VALUES ('success login', 'Успешный вход'),
           ('wrong password', 'Неправильный пароль'),
           ('failure (too many attempts)', 'Отказ (зарегистрировано большое количество некорректных попыток входа)'),
           ('failure (no rights)', 'Отказ (нет прав)'),
           ('failure (deleted)', 'Отказ (удален)'),
           ('error', 'Ошибка'),
           ('success logout (command)', 'Выход по команде'),
           ('success logout (timeout)', 'Выход по таймауту');

CREATE TABLE log.authentication_log(
    id BIGSERIAL PRIMARY KEY,
    created TIMESTAMP NOT NULL DEFAULT now(),
    operation VARCHAR(8) NOT NULL,
    form_login TEXT NOT NULL,
    user_id BIGINT REFERENCES sui_security.users(id),
    client_info TEXT,
    result_id BIGINT NOT NULL REFERENCES log.authentication_result(id)
);
