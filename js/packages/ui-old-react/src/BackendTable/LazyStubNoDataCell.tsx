import {TableCell} from "@sui/deps-material";
import * as React from "react";
import {Empty} from "@sui/deps-antd";
import {TABLE_NO_DATA_CELL_SMALL} from "@/styles";

export const LazyStubNoDataCell = (showAll: () => void) => ({colSpan}: { colSpan?: number | undefined }): JSX.Element => (
  <TableCell
    style={{height: 180}}
    colSpan={colSpan}
  >
    <Empty
      style={{width: "100%", position: "absolute", marginTop: -65}}
      description={(
        <span>
          <span>Заполните фильтры или </span>
          <a onClick={showAll}>нажмите сюда</a>
          <span> для показа всех записей в таблице</span>
        </span>
      )}/>
  </TableCell>
);

export const LazyStubNoDataCellSmall = (showAll: () => void) => ({colSpan}: { colSpan?: number | undefined }): JSX.Element => (
  <TableCell
    style={{
      paddingLeft: 64
    }}
    className={TABLE_NO_DATA_CELL_SMALL}
    colSpan={colSpan}
  >
    <div>
      <span>
        <span>Заполните фильтры или </span>
        <a onClick={showAll}>нажмите сюда</a>
        <span> для показа всех записей в таблице</span>
      </span>
    </div>
  </TableCell>
);
