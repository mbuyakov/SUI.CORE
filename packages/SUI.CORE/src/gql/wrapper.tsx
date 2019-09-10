import { ApolloQueryResult } from 'apollo-client';
import { FetchResult } from 'apollo-link';
import gql from 'graphql-tag';

import { loadingErrorNotification } from '../drawUtils';
import { IObjectWithIndex } from '../other';

import { getGqlClient } from './client';

/**
 * Stub for PostGraphile error format
 * If promise resolved and resolve contain errors field - print all error in console and throw first error
 */
async function rejectOnError<T>(promise: Promise<ApolloQueryResult<T> | FetchResult<T>>): Promise<T> {
  return new Promise<T>(
    (resolve, reject): void => {
      promise
        .then(value => {
          if (value.errors) {
            // tslint:disable-next-line:no-any
            value.errors.forEach((error: any) => {
              console.error('PostGraphile error', error);
            });
            reject(value.errors[0].message);
          } else {
            resolve(value.data);
          }
        })
        .catch(reject);
    },
  );
}

/**
 * Extract keys from object if it has only one key
 */
// tslint:disable-next-line:no-any
function extractKeys(obj: IObjectWithIndex, extractKeysLevel: number | boolean): any {
  // tslint:disable-next-line:no-parameter-reassignment
  extractKeysLevel = typeof extractKeysLevel === 'boolean' ? 1 : extractKeysLevel;

  let ret = obj;
  for (let i = 1; i <= extractKeysLevel; i++) {
    const keys = Object.keys(ret);
    if (keys.length > 1) {
      throw new Error(`Multiple key in query answer at level ${i}`);
    }

    if (keys.length === 0) {
      throw new Error(`No keys in query answer at level ${i}`);
    }

    ret = ret[keys[0]];
  }

  return ret;
}

/**
 * Gql query
 * any - query after gql tag
 * For backward compatibility extractKeysLevel=true equals to extractKeysLevel=1
 */
// tslint:disable-next-line:no-any
export async function query<T>(queryBody: string | any, extractKeysLevel: boolean | number = false): Promise<T> {
  if (typeof queryBody === 'string') {
    // tslint:disable-next-line:no-parameter-reassignment
    queryBody = gql(queryBody);
  }

  let ret = rejectOnError<T>(
    getGqlClient().query({
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
      query: queryBody,
    }),
  );
  if (extractKeysLevel) {
    ret = ret.then((value => extractKeys(value, extractKeysLevel)));
  }

  return ret;
}

/**
 * Gql mutate
 * any - mutate after gql tag
 */
// tslint:disable-next-line:no-any
export async function mutate<T>(mutationBody: string | any, extractKeysLevel: boolean | number = false): Promise<T> {
  if (typeof mutationBody === 'string') {
    // tslint:disable-next-line:no-parameter-reassignment
    mutationBody = gql(mutationBody);
  }

  let ret = rejectOnError<T>(
    getGqlClient().mutate({
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
      mutation: mutationBody,
    }),
  );
  if (extractKeysLevel) {
    ret = ret.then((value => extractKeys(value, extractKeysLevel)));
  }

  return ret;
}

/**
 * Wrap query to add loadErrorNotification
 */
export async function queryWrapper<T>(originalQuery: Promise<T>): Promise<T> {
  return originalQuery.catch(reason => {
    loadingErrorNotification(reason.stack ? reason.stack.toString() : reason.toString());
    throw reason;
  });
}
