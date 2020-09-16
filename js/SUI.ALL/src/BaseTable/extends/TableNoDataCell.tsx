import TableCell from '@material-ui/core/TableCell';
import Empty from 'antd/lib/empty';
import * as React from 'react';

export const TableNoDataCell = ({colSpan}: { colSpan?: number | undefined }): JSX.Element => (
  <TableCell
    style={{height: 180}}
    colSpan={colSpan}
  >
    <Empty style={{width: '100%', position: 'absolute', marginTop: -65}}/>
  </TableCell>
);

export const TableNoDataCellSmall = ({colSpan}: { colSpan?: number | undefined }): JSX.Element => (
  <TableCell
    style={{
      backgroundColor: "#fafafa",
      paddingLeft: 64
    }}
    colSpan={colSpan}
  >
    <div>
      Нет данных
    </div>
  </TableCell>
);
