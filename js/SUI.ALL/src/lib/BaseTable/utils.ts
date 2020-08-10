import {NO_DATA_TEXT} from "../const";
import {getDataByKey} from "../dataKey";
import {IObjectWithIndex} from "../other";
import {translate} from "../translate";
import {defaultIfNotBoolean} from "../typeWrappers";
import {IBaseTableColLayout, IBaseTableProps, IFormattedBaseTableColLayout} from "./types";
import * as XLSX from 'xlsx';

export function mapColumns(cols: IBaseTableColLayout[]): IFormattedBaseTableColLayout[] {
  return cols.map(col => ({
    ...col,
    getCellValue: (row: any): any => (col.dataKey && getDataByKey(row, col.dataKey)) || (col.defaultData !== undefined ? col.defaultData : row[col.id]),
    name: col.id,
    title: col.title || translate(col.id, true) || translate(col.id.replace(/Id$/, '')),
  }));
}

export function exportToXlsx(
  columns: IBaseTableColLayout[],
  data: IObjectWithIndex[],
  options: {
    exportValueFormatter?: IBaseTableProps["exportValueFormatter"],
    file?: boolean
    hiddenColumnNames?: string[],
    opts?: XLSX.WritingOptions
  }
): Blob | undefined {
  const hiddenColumnNames = options.hiddenColumnNames || [];

  const exportedColumns = (mapColumns(columns))
    .filter(col => defaultIfNotBoolean(col.exportable, true))
    .filter(col => !hiddenColumnNames.includes(col.id));

  const formattedData = data.map(row =>
    Object.fromEntries(exportedColumns.map(col => {
      let value = col.getCellValue(row);

      if (value == null) {
        value = NO_DATA_TEXT;
      } else if (options.exportValueFormatter) {
        value = options.exportValueFormatter(col, value, row);
      }

      return [col.title, value]
    }))
  );

  const ws = XLSX.utils.json_to_sheet(formattedData, { header: exportedColumns.map(it => it.title) });

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, '1');

  if (options.file) {
    XLSX.writeFile(wb, 'table.xlsx', options.opts);
    return undefined;
    // tslint:disable-next-line:unnecessary-else
  } else {
    return XLSX.write(wb, options.opts);
  }
}
