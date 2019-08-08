import TableCell from '@material-ui/core/TableCell';
import Empty from 'antd/lib/empty';
import * as React from 'react';

// tslint:disable-next-line:variable-name no-any
export const TableNoDataCell = ({colSpan}: { colSpan?: any }): JSX.Element => (
  <TableCell
    style={{height: 180}}
    colSpan={colSpan}
  >
    <Empty style={{width: '100%', position: 'absolute', marginTop: -65}}/>
  </TableCell>
);
