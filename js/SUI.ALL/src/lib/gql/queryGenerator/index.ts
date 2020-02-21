import {IObjectWithIndex} from "../../other";
import {addQuotesIfString, camelCase, capitalize} from "../../stringFormatters";
import {IGqlFilter} from "../types";
import { mutate, query } from '../wrapper';

export type PossibleId = string | number;
export type PossibleValue = string | number | boolean;

/**
 * Generate Gql query for select
 */
export function generateSelectText(entity: string, id: PossibleId, field: string): string {
  const camelCaseEntity = camelCase(entity);

  return `{
  ${camelCaseEntity}ById(id: ${addQuotesIfString(id)}) {
    ${field}
  }
}`;
}

/**
 * Generate promise for Gql query
 */
export async function generateSelect<T extends PossibleValue>(entity: string, id: PossibleId, field: string): Promise<T> {
  return query<T>(generateSelectText(entity, id, field), 2);
}

/**
 * Generate Gql mutation for update
 */
export function generateUpdateText(entity: string, id: PossibleId, field: string, value: PossibleValue): string {
  const camelCaseEntity = camelCase(entity);

  return `mutation {
  update${capitalize(camelCaseEntity)}ById(input: {id: ${addQuotesIfString(id)}, ${camelCaseEntity}Patch: {${field}: ${addQuotesIfString(value)}}}) {
    clientMutationId
  }
}`;
}

/**
 * Generate promise for Gql update
 */
export async function generateUpdate(entity: string, id: PossibleId, field: string, value: PossibleValue): Promise<void> {
  await mutate(generateUpdateText(entity, id, field, value));
}

/**
 * Generate promise for Gql update
 */
export function generateUpdateFn(entity: string, id: PossibleId, field: string): (value: PossibleValue) => Promise<void> {
  return (value: PossibleValue) => generateUpdate(entity, id, field, value);
}

/**
 * Generate Gql mutation for update
 * Available fields types - string, number, boolean
 */
export function generateMultiUpdateText(entity: string, id: PossibleId, fields: object): string {
  const camelCaseEntity = camelCase(entity);

  return `mutation {
  update${capitalize(camelCaseEntity)}ById(input: {id: ${addQuotesIfString(id)}, ${camelCaseEntity}Patch: {${format(fields, false)}}}) {
    clientMutationId
  }
}`;
}

/**
 * Generate promise for Gql update
 * Available fields types - string, number, boolean
 */
export async function generateMultiUpdate(entity: string, id: PossibleId, fields: object): Promise<void> {
  await mutate(generateMultiUpdateText(entity, id, fields));
}

/**
 * Generate promise for Gql update
 * Available fields types - string, number, boolean
 */
export function generateMultiUpdateFn(entity: string, id: PossibleId): (fields: object) => Promise<void> {
  return async (fields: object): Promise<void> => mutate(generateMultiUpdateText(entity, id, fields));
}

/**
 * Generate Gql mutation for create
 * Available fields types - string, number, boolean
 */
export function generateCreateText(entity: string, fields: object): string {
  const camelCaseEntity = camelCase(entity);

  return `mutation {
  create${capitalize(camelCaseEntity)}(input: {${camelCaseEntity}: {${format(fields, true)}}}) {
    ${camelCaseEntity} {
      id
    }
  }
}`;
}

/**
 * Fields formatter for textGenerators
 */
function format(fields: object, excludeNulls: boolean): string {
  return Object.keys(fields)
    .filter(key => !key.startsWith('_'))
    .filter(key => excludeNulls ? ((fields as IObjectWithIndex)[key] != null) : true)
    .map(key => {
      const value = (fields as IObjectWithIndex)[key];
      const valueStr = Array.isArray(value)
        // tslint:disable-next-line
        ? `[${value.map(element => addQuotesIfString(element))}]`
        : addQuotesIfString(value);

      return `${key}: ${valueStr}`;
    })
    .join(",");
}

/**
 * Generate promise for Gql create
 * Available fields types - string, number, boolean
 * @return created entity id
 */
export async function generateCreate<T = void>(entity: string, fields: object): Promise<T> {
  return mutate(generateCreateText(entity, fields), 2);
}

/**
 * Generate promise for Gql create
 * Available fields types - string, number, boolean
 */
export function generateCreateFn<T = void>(entity: string): (fields: object) => Promise<T> {
  return (fields: object) => generateCreate(entity, fields);
}

/**
 * Generate Gql mutation for create
 * Available fields types - string, number, boolean
 */
export function generateDeleteText(entity: string, id: PossibleId): string {
  const camelCaseEntity = camelCase(entity);

  return `mutation {
  delete${capitalize(camelCaseEntity)}ById(input: {id: ${addQuotesIfString(id)}}) {
    clientMutationId
  }
}`;
}

/**
 * Generate promise for Gql create
 * Available fields types - string, number, boolean
 */
export async function generateDelete(entity: string, id: PossibleId): Promise<void> {
  await mutate(generateDeleteText(entity, id));
}

/**
 * Generate promise for Gql create
 * Available fields types - string, number, boolean
 */
export function generateDeleteFn(entity: string): (id: PossibleId) => Promise<void> {
  return (id: PossibleId) => generateDelete(entity, id);
}

/**
 * Stringify GraphQL filter for query
 */
// tslint:disable-next-line:completed-docs
export function stringifyGqlFilter<T = {}>(filter: {filter: IGqlFilter<T>}): string {
  return `filter: ${JSON.stringify(filter.filter).replace(/"([^"]+)":/g, "$1:")}`;
}

/**
 * Joins several mutate queries into one.
 *
 * @param queries - queries to join.
 *
 * @return joint mutation query consists of all the incoming queries.
 */
export function concatQueryTexts(queries: string[]): string {
  if(queries) {
    const queriesInside = queries
      .map(unpackQueryTextFromCurlyBrackets)
      .filter(Boolean)
      .join("\n");

    return `mutation {
      ${queriesInside}
      }`;
  }

  return null;
}

/**
 * Extract GraphQL query from first wrapper mutation {...} in query text.
 *
 * @return string - text of query inside curly brackets.
 *  }.
 */
function unpackQueryTextFromCurlyBrackets(queryText: string): string {
  const start: number = queryText.indexOf('{');
  const end: number = queryText.lastIndexOf('}');
  if(start === -1 || start >= end) {
    return null;
  }

  return queryText.substring(start + 1, end);
}
