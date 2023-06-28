import TableCell from "@mui/material/TableCell";
import * as React from "react";
import {FileSearchOutlined} from "@ant-design/icons";
import {Empty} from "@sui/deps-antd";
import {TABLE_NO_DATA_CELL_SMALL} from "@/styles";

export const LoadingNoDataCell = ({colSpan}: { colSpan?: number | undefined }): JSX.Element => (
  <TableCell
    style={{height: 180}}
    colSpan={colSpan}
  >
    <Empty style={{width: "100%", position: "absolute", marginTop: -65}} image={<FileSearchOutlined style={{fontSize: 100, color: "#dce0e6"}}/>} description="Загрузка..."/>
  </TableCell>
);

export const LoadingNoDataCellSmall = ({colSpan}: { colSpan?: number | undefined }): JSX.Element => (
  <TableCell
    style={{
      paddingLeft: 64
    }}
    className={TABLE_NO_DATA_CELL_SMALL}
    colSpan={colSpan}
  >
    <div>
      Загрузка...
    </div>
  </TableCell>
);
