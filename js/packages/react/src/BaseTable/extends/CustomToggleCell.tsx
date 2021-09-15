import {TableRowDetail} from '@devexpress/dx-react-grid-material-ui';
import IconButton from '@material-ui/core/IconButton';
import {withStyles} from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import {ExpandMore, KeyboardArrowRight} from '@material-ui/icons';
import classNames from 'clsx';
import * as React from 'react';
import {IObjectWithIndex} from "@sui/core";


interface ITableDetailToggleCellBaseProps extends TableRowDetail.ToggleCellProps {
  classes: IObjectWithIndex;
  className?: string;
  style?: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const styles = (theme: any): any => ({
  toggleCell: {
    paddingBottom: 0,
    paddingLeft: theme.spacing(1),
    paddingTop: 0,
    textAlign: 'center',
    textOverflow: 'initial',
  },
  toggleCellButton: {
    display: 'inline-block',
    padding: theme.spacing(1),
    verticalAlign: 'middle',
  },
});

// SRC: https://github.com/DevExpress/devextreme-reactive/blob/master/packages/dx-react-grid-material-ui/src/templates/table-detail-toggle-cell.jsx
class TableDetailToggleCellBase extends React.Component<ITableDetailToggleCellBaseProps> {

  public render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {style, expanded, classes, onToggle, tableColumn, tableRow, row, className, ...restProps} = this.props;

    return (
      <TableCell
        className={classNames(classes.toggleCell, className)}
        style={style}
        {...restProps}
      >
        <IconButton
          className={classes.toggleCellButton}
          onClick={(e): void => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {
            expanded
              ? <ExpandMore/>
              : <KeyboardArrowRight/>
          }
        </IconButton>
      </TableCell>
    );
  }

}

export const CustomToggleCell = withStyles(styles, {name: "TableDetailToggleCell"})(TableDetailToggleCellBase);
