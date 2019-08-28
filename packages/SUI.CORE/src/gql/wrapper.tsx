import {ApolloQueryResult} from "apollo-client";
import {FetchResult} from "apollo-link";
import gql from "graphql-tag";

import {getDataByKey} from "../dataKey";
import {loadingErrorNotification} from "../drawUtils";
import {IObjectWithIndex} from "../other";

import {getClient} from "./client";

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
              console.error("PostGraphile error", error)
            });
            reject(value.errors[0].message);
          } else {
            // tslint:disable-next-line:no-any
            resolve(value.data as any);
          }
        })
        .catch(reject);
    },
  );
}

/**
 * Gql query
 * any - query after gql tag
 */
// tslint:disable-next-line:no-any
export async function query<T>(queryBody: string | any, extractFirstKey: boolean = false): Promise<T> {
  if (typeof queryBody === "string") {
    // tslint:disable-next-line:no-parameter-reassignment
    queryBody = gql(queryBody);
  }

  const accessToken = getUserAccessToken();

  let ret = rejectOnError<T>(
    getClient().query({
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      query: queryBody,
      ...(accessToken && {
        context: {
          headers: {
            authorization: `Bearer ${accessToken}`
          }
        }
      })
    }),
  );
  if (extractFirstKey) {
    ret = ret.then(value => {
      const keys = Object.keys(value);
      if (keys.length > 1) {
        throw new Error("Multiple key in query answer");
      }

      return (value as IObjectWithIndex)[keys[0]];
    });
  }

  return ret;
}

// TODO перебросить интерфейсы из RN.PILOT
/**
 * Extract user accessToken from window
 */
function getUserAccessToken(): string | null {
  const storeGetState = getDataByKey(window, 'g_app', '_store', 'getState');

  return storeGetState && getDataByKey(storeGetState(), 'user', 'user', 'accessToken') || null;
}

/**
 * Gql mutate
 * any - mutate after gql tag
 */
// tslint:disable-next-line:no-any
export async function mutate<T>(mutationBody: string | any, extractFirstKey: boolean = false): Promise<T> {
  if (typeof mutationBody === "string") {
    // tslint:disable-next-line:no-parameter-reassignment
    mutationBody = gql(mutationBody);
  }

  const accessToken = getUserAccessToken();

  let ret = rejectOnError<T>(
    getClient().mutate({
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      mutation: mutationBody,
      ...(accessToken && {
        context: {
          headers: {
            authorization: `Bearer ${accessToken}`
          }
        }
      })
    }),
  );
  if (extractFirstKey) {
    // tslint:disable-next-line:no-any
    ret = ret.then((value: any) => {
      const keys = Object.keys(value);
      if (keys.length > 1) {
        throw new Error("Multiple key in mutate answer");
      }

      return (value as IObjectWithIndex)[keys[0]];
    });
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
