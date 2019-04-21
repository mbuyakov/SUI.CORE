import { loadingErrorNotification } from "@/drawUtils";
import { getClient } from "@/gql/client";
import { IObjectWithIndex } from "@/other";
import { ApolloQueryResult } from "apollo-client";
import { FetchResult } from "apollo-link";
import gql from "graphql-tag";

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
            resolve(value.data);
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
  let ret = rejectOnError<T>(
    getClient().query({
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      query: queryBody,
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
  let ret = rejectOnError<T>(
    getClient().mutate({
      errorPolicy: "all",
      fetchPolicy: "no-cache",
      mutation: mutationBody,
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
