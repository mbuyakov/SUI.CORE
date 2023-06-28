import * as React from "react";
import PropTypes from "prop-types";
import classNames from "clsx";
import { TableCell, styled, IconButton } from "@mui/material";

import ExpandMore from "@mui/icons-material/ExpandMore";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

const PREFIX = "TableDetailToggleCell";
export const classes = {
  toggleCell: `${PREFIX}-toggleCell`,
  toggleCellButton: `${PREFIX}-toggleCellButton`,
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${classes.toggleCell}`]: {
    textAlign: "center",
    textOverflow: "initial",
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: theme.spacing(1),
  },
}));

export const CustomToggleCell = ({
                                        style, expanded, onToggle,
                                        tableColumn, tableRow, row,
                                        className, forwardedRef,
                                        ...restProps
                                      }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onToggle();
  };
  return (
    <StyledTableCell
      className={classNames(classes.toggleCell, className)}
      style={style}
      ref={forwardedRef}
      {...restProps}
    >
      <IconButton onClick={handleClick}>
        {
          expanded
            ? <ExpandMore />
            : <KeyboardArrowRight />
        }
      </IconButton>
    </StyledTableCell>
  );
};

CustomToggleCell.propTypes = {
  style: PropTypes.object,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  className: PropTypes.string,
  tableColumn: PropTypes.object,
  tableRow: PropTypes.object,
  row: PropTypes.any,
  forwardedRef: PropTypes.func,
};

CustomToggleCell.defaultProps = {
  style: null,
  expanded: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onToggle: () => {},
  className: undefined,
  tableColumn: undefined,
  tableRow: undefined,
  row: undefined,
  forwardedRef: undefined,
};
