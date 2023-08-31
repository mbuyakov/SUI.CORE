/* eslint-disable @typescript-eslint/no-explicit-any */

import {getSUISettings} from "@/core";
import {IObjectWithIndex} from "@sui/util-types";
import {gql, ApolloQueryResult, FetchResult} from "@sui/deps-gql";
/**
 * Stub for PostGraphile error format
 * If promise resolved and resolve contain errors field - print all error in console and throw first error
 */
async function rejectOnError<T>(promise: Promise<ApolloQueryResult<T> | FetchResult<T>>): Promise<T> {
  return new Promise<T>(
    (resolve, reject): void => {
      promise
        .then(value => {
          // @ts-ignore
          if (value.errors) {
            // @ts-ignore
            value.errors.forEach((error: any) => {
              console.error("PostGraphile error", error);
            });
            // @ts-ignore
            reject(value.errors[0].message);
          } else {
            resolve(value.data === null ? undefined : value.data);
          }
        })
        .catch(reject);
    },
  );
}

/**
 * Extract keys from object if it has only one key
 */
function extractKeys(obj: IObjectWithIndex, extractKeysLevel: number | boolean): any {
  extractKeysLevel = typeof extractKeysLevel === "boolean" ? 1 : extractKeysLevel;

  let ret = obj;
  for (let i = 1; i <= extractKeysLevel; i++) {
    const keys = Object.keys(ret).filter(key => key !== "__typename");
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
export async function query<T>(queryBody: string | any, extractKeysLevel: boolean | number = false): Promise<T> {
  if (typeof queryBody === "string") {
    queryBody = gql(queryBody);
  }

  let ret = rejectOnError<T>(
    getSUISettings().apolloClient.query({
      errorPolicy: "all",
      fetchPolicy: "no-cache",
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
export async function mutate<T>(mutationBody: string | any, extractKeysLevel: boolean | number = false): Promise<T> {
  if (typeof mutationBody === "string") {
    mutationBody = gql(mutationBody);
  }

  let ret = rejectOnError<T>(
    getSUISettings().apolloClient.mutate({
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      mutation: mutationBody,
    }),
  );
  if (extractKeysLevel) {
    ret = ret.then((value => extractKeys(value, extractKeysLevel)));
  }

  return ret;
}
