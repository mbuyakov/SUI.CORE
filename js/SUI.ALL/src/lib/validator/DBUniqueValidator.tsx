import {query} from "../gql";
import {IObjectWithIndex} from "../other";
import {addQuotesIfString} from "../stringFormatters";


export type gqlCompareOperations = 'equalTo' | 'notEqualTo' | 'distinctFrom' | 'notDistinctFrom';
export interface IQueryResult {
  table: {
    nodes: {
      __id: string
    },
    totalCount: number,
  }
}

export async function DBUniqueValidator(gqTable: string,
                                        queryFields: IObjectWithIndex,
                                        idFieldName: string = 'id',
                                        excludeId: string = null): Promise<IQueryResult> {
  const fieldsFilter = createFieldsFilter(queryFields, idFieldName, excludeId);
  if (!gqTable || !fieldsFilter || fieldsFilter.length === 0) {
    return null;
  }

  return query<IQueryResult>(`
    {
      table: ${gqTable}(filter: ${fieldsFilter}) {
        totalCount
        nodes {
          __id: ${idFieldName}
        }
      }
    }
    `);
}


function createFieldsFilter(fields: IObjectWithIndex, idFieldName: string, excludeId: string): string {
  const filters = fieldsToFilterStrings(fields, 'equalTo', true);
  if (excludeId && excludeId.length > 0) {
    filters.push(getFilterExpression(idFieldName, 'notEqualTo', excludeId));
  }
  if (filters.length === 0) {
    return "";
  }
  if (filters.length < 2) {
    return filters[0];
  }

  return `{and: [${filters.join(",")}]}`;
}

function fieldsToFilterStrings(fields: IObjectWithIndex, comparator: gqlCompareOperations, excludeNulls: boolean): string[] {
  if (!fields) {
    return [];
  }

  return Object.keys(fields)
    .filter(key => excludeNulls || (fields[key] != null))
    .map(key => getFilterExpression(key, comparator, fields[key]));
}

// tslint:disable-next-line:no-any
function getFilterExpression(field: string, comparator: gqlCompareOperations, value: any): string {
  return `{${field}: {${comparator}: ${addQuotesIfString(value)}}}`;
}
