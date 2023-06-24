import {getXlsx, WritingOptions} from "@sui/ui-old-charts";
import {defaultIfNotBoolean, getDataByKey, IObjectWithIndex, NO_DATA_TEXT} from "@sui/ui-old-core";

// noinspection ES6PreferShortImport
import {translate} from "../translate";

import {IBaseTableColLayout, IBaseTableProps, IFormattedBaseTableColLayout} from "./types";

export function mapColumns(cols: IBaseTableColLayout[]): IFormattedBaseTableColLayout[] {
  return cols.map(col => ({
    ...col,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCellValue: (row: any): any => (col.dataKey && getDataByKey(row, col.dataKey)) || (col.defaultData !== undefined ? col.defaultData : row[col.id]),
    name: col.id,
    title: col.title || translate(col.id, true) || translate(col.id.replace(/Id$/, '')),
  }));
}

export async function exportToXlsx(
  columns: IBaseTableColLayout[],
  data: IObjectWithIndex[],
  options: {
    exportValueFormatter?: IBaseTableProps["exportValueFormatter"],
    file?: boolean
    hiddenColumnNames?: string[],
    opts?: WritingOptions
  }
): Promise<Blob | undefined> {
  const xlsx = await getXlsx();
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

  const ws = xlsx.utils.json_to_sheet(formattedData, {header: exportedColumns.map(it => it.title)});

  const wb = xlsx.utils.book_new();

  xlsx.utils.book_append_sheet(wb, ws, '1');

  if (options.file) {
    xlsx.writeFile(wb, 'table.xlsx', options.opts);
    return undefined;
    // tslint:disable-next-line:unnecessary-else
  } else {
    return xlsx.write(wb, options.opts);
  }
}
