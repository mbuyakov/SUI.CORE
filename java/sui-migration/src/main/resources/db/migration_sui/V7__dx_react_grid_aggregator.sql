-- DROP OLD
CREATE FUNCTION sui_meta.delete_old_dx_react_grid_group_row_end_position_aggregate()
    RETURNS VOID
    LANGUAGE plpgsql
AS
$$
DECLARE __schema TEXT;
    BEGIN
        FOR __schema IN (SELECT schema_name FROM information_schema.schemata) LOOP
            EXECUTE format(
                    'DROP AGGREGATE IF EXISTS %s.dx_react_grid_group_row_end_position(BOOLEAN, BIGINT, BIGINT, BIGINT, BIGINT)',
                    __schema
                );
            EXECUTE format(
                    'DROP FUNCTION IF EXISTS %s.dx_react_grid_group_row_end_position_sfunc(BIGINT, BOOLEAN, BIGINT, BIGINT, BIGINT, BIGINT)',
                    __schema
                );
        END LOOP;
    END;
$$;

SELECT sui_meta.delete_old_dx_react_grid_group_row_end_position_aggregate();

DROP FUNCTION sui_meta.delete_old_dx_react_grid_group_row_end_position_aggregate();


-- CREATE NEW
CREATE FUNCTION sui_meta.dx_react_grid_group_row_end_position_sfunc(
    last_row_end_position bigint, expanded boolean, page_size bigint, elements bigint, level bigint, max_level bigint
) RETURNS BIGINT
    LANGUAGE plpgsql
AS
$$
DECLARE
    start_position BIGINT;
    page_wraps BIGINT;
BEGIN
    start_position = last_row_end_position + 1;

    IF start_position % page_size = 1 THEN
        start_position := start_position + level - 1;
    END IF;

    IF expanded AND level = max_level THEN
        page_wraps = (GREATEST((start_position - 1) % page_size, level) - level + elements) / (page_size - level);
        start_position := start_position + elements + page_wraps * level;
    END IF;

    start_position := start_position + 1;

    RETURN start_position - 1;
END;
$$;


CREATE AGGREGATE sui_meta.dx_react_grid_group_row_end_position(expanded boolean, page_size bigint, elements bigint, level bigint, max_level bigint) (
    SFUNC = sui_meta.dx_react_grid_group_row_end_position_sfunc,
    STYPE = bigint,
    INITCOND = '0'
);

