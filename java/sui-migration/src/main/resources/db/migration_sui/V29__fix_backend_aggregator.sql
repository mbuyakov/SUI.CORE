CREATE OR REPLACE FUNCTION sui_meta.dx_react_grid_group_row_end_position_sfunc(
    last_row_end_position BIGINT,
    expanded BOOLEAN,
    page_size BIGINT,
    elements BIGINT,
    level BIGINT,
    max_level BIGINT
)
    RETURNS BIGINT
    LANGUAGE plpgsql
AS $$
    DECLARE
        end_position BIGINT;
        page_wraps BIGINT;
    BEGIN
        end_position := last_row_end_position + (CASE WHEN last_row_end_position % page_size = 0 THEN level ELSE 1 END);

        IF expanded AND level = max_level THEN
            page_wraps := (((end_position - 1) % page_size) - level + elements) / (page_size - level);
            end_position := end_position + elements + page_wraps * level;
        END IF;

        RETURN end_position;
    END;
$$;
