import TableCell from '@material-ui/core/TableCell';
import Empty from 'antd/lib/empty';
import * as React from 'react';
import {TABLE_NO_DATA_CELL_SMALL} from "@/styles";

export const LazyStubNoDataCell = (showAll: () => void) => ({colSpan}: { colSpan?: number | undefined }): JSX.Element => (
  <TableCell
    style={{height: 180}}
    colSpan={colSpan}
  >
    <Empty style={{width: '100%', position: 'absolute', marginTop: -65}} description={<span>Заполните фильтры или <a onClick={showAll}>нажмите сюда</a> для показа всех записей в таблице</span>}/>
  </TableCell>
);

