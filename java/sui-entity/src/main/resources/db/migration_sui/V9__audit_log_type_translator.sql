CREATE FUNCTION sui_utils.translate_audit_log_type(type TEXT)
    RETURNS TEXT
    LANGUAGE plpgsql
AS
$$
    DECLARE
        result TEXT;
    BEGIN
        SELECT CASE
                   WHEN type = 'INSERT' THEN 'Создание'
                   WHEN type = 'DELETE' THEN 'Удаление'
                   WHEN type = 'UPDATE' THEN 'Изменение'
                   ELSE type END
        INTO result;
        RETURN result;
    END;
$$;
