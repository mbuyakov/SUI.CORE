import {IObjectWithIndex} from "../../other";
import {addQuotesIfString, camelCase, capitalize} from "../../stringFormatters";
import {IGqlFilter} from "../types";
import {mutate} from "../wrapper";

export type PossibleId = string | number;
export type PossibleValue = string | number | boolean;

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
 * Generate Gql mutation for create
 * Available fields types - string, number, boolean
 */
export function generateCreateText(entity: string, fields: object): string {
  const camelCaseEntity = camelCase(entity);

  return `mutation {
  create${capitalize(camelCaseEntity)}(input: {${camelCaseEntity}: {${Object.keys(fields).filter(key => (fields as IObjectWithIndex)[key] != null).map(key => `${key}: ${addQuotesIfString((fields as IObjectWithIndex)[key])}`) as unknown as string}}}) {
    ${camelCaseEntity} {
      id
    }
  }
}`;
}

/**
 * Generate promise for Gql create
 * Available fields types - string, number, boolean
 */
export async function generateCreate(entity: string, fields: object): Promise<void> {
  await mutate(generateCreateText(entity, fields));
}

/**
 * Generate promise for Gql create
 * Available fields types - string, number, boolean
 */
export function generateCreateFn(entity: string): (fields: object) => Promise<void> {
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