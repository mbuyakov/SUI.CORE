import TableCell from '@material-ui/core/TableCell';
import * as React from 'react';
import {Empty} from "antd";
import {TABLE_NO_DATA_CELL_SMALL} from "@/styles";

export const TableNoDataCell = ({colSpan}: { colSpan?: number | undefined }): JSX.Element => (
  <TableCell
    style={{height: 180}}
    colSpan={colSpan}
  >
    <Empty style={{width: '100%', position: 'absolute', marginTop: -65}} description="Нет данных"/>
  </TableCell>
);

export const TableNoDataCellSmall = ({colSpan}: { colSpan?: number | undefined }): JSX.Element => (
  <TableCell
    style={{
      paddingLeft: 64
    }}
    className={TABLE_NO_DATA_CELL_SMALL}
    colSpan={colSpan}
  >
    <div>
      Нет данных
    </div>
  </TableCell>
);
