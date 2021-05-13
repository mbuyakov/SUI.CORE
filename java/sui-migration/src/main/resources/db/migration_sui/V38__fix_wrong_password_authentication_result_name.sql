UPDATE log.authentication_result
SET name = 'Неправильный логин или пароль'
WHERE code = 'wrong password';
