import {addPluralEnding, camelCase, capitalize, ColumnInfo, IObjectWithIndex, query, TableInfo, TableInfoManager} from "@sui/core";

// noinspection ES6PreferShortImport
import {getReferencedTableInfo} from "../utils";

export async function fetchAllRows<T = IObjectWithIndex>(tableInfo: TableInfo): Promise<T[]> {
  const columns = await tableInfo.getColumns();

  return query<T[]>(`{
    all${capitalize(addPluralEnding(camelCase(tableInfo.tableName)))} {
      nodes {
        ${columns.map(column => camelCase(column.columnName)).join(" ")}
      }
    }
  }`, 2);
}

export async function fetchJoinTable(
  joinTableName: string | { first?: TableInfo; second?: TableInfo; }
): Promise<TableInfo> {
  let joinTableInfo: TableInfo;

  if (typeof (joinTableName) === "string") {
    joinTableInfo = await TableInfoManager.getById(joinTableName);
  } else {
    const {first, second} = joinTableName;

    if (first && second) {
      // TODO: костыль для roles
      const [firstTableName, secondTableName] = [first, second].map(table => table.tableName).map(tableName => tableName === "roles" ? "role" : tableName);
      const firstPossibleName = joinTableNames(firstTableName, secondTableName);
      const secondPossibleName = joinTableNames(secondTableName, firstTableName);

      joinTableInfo = (await TableInfoManager.containsById(firstPossibleName))
        ? (await TableInfoManager.getById(firstPossibleName))
        : (await TableInfoManager.containsById(secondPossibleName))
          ? (await TableInfoManager.getById(secondPossibleName))
          : undefined;
    }
  }

  return joinTableInfo;
}

export function joinTableNames(...tableNames: string[]): string {
  return tableNames.join('_');
}

export async function findColumnsByReferencedTable(
  baseTableInfo: TableInfo,
  referencedTableInfoId: TableInfo["id"]
): Promise<ColumnInfo[]> {
  const columns = await baseTableInfo.getColumns();
  const result = [];

  for (const column of columns) {
    const referencedTableInfo = await getReferencedTableInfo(column);

    if (referencedTableInfo && referencedTableInfo.id === referencedTableInfoId) {
      result.push(column);
    }
  }

  return result;
}

export async function findColumnByReferencedTable(
  baseTableInfo?: TableInfo,
  referencedTableInfo?: TableInfo,
  filter?: (column: ColumnInfo) => boolean
): Promise<ColumnInfo> {
  if (baseTableInfo && referencedTableInfo) {
    const referenceColumns = await findColumnsByReferencedTable(baseTableInfo, referencedTableInfo.id);
    const columnFilter = filter ? filter : (): boolean => true;

    return referenceColumns.filter(columnFilter)[0];
  }

  return undefined;
}
