CREATE OR REPLACE FUNCTION sui_meta.dx_react_grid_group_row_end_position_sfunc(
    last_row_end_position bigint,
    expanded boolean,
    page_size bigint,
    elements bigint,
    level bigint,
    max_level bigint
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
            page_wraps = (GREATEST((start_position - 1) % page_size, level) - level + elements - 1) / (page_size - level);
            start_position := start_position + elements + page_wraps * level;
        END IF;

        start_position := start_position + 1;

        RETURN start_position - 1;
    END;
$$;
