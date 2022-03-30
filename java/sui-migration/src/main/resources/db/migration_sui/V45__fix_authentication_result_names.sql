UPDATE log.authentication_result
SET name = 'Отказано в доступе. Превышен лимит неудачных попыток входа'
WHERE name = 'Отказ (зарегистрировано большое количество некорректных попыток входа)';

UPDATE log.authentication_result
SET name = 'Отказано в доступе. Недостаточно прав'
WHERE name = 'Отказ (нет прав)';

UPDATE log.authentication_result
SET name = 'Отказано в доступе. Пользователь заблокирован'
WHERE name = 'Отказ (пользователь заблокирован)';

UPDATE log.authentication_result
SET name = 'Отказано в доступе. Пользователь удален'
WHERE name = 'Отказ (удален)';