CREATE VIEW ui.authentication_log_ui AS
    SELECT id,
           created,
           CASE
               WHEN operation = 'LOGIN' THEN 'вход в систему'
               WHEN operation = 'LOGOUT' THEN 'выход из системы'
               ELSE operation END AS operation,
           form_login,
           user_id,
           client_info,
           result_id,
           remote_address,
           session_id
    FROM log.authentication_log;

COMMENT ON COLUMN ui.authentication_log_ui.user_id IS '@references sui_security.users(id)';
COMMENT ON COLUMN ui.authentication_log_ui.result_id IS '@references log.authentication_result(id)';
