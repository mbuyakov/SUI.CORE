import ApolloClient from "apollo-client";

let CLIENT: ApolloClient<{}> | undefined;

/**
 * Must be call before use Gql wrappers
 */
export function init(clientInstance: ApolloClient<{}>): void {
  CLIENT = clientInstance;
}

/**
 * Get client instance
 */
export function getClient(): ApolloClient<{}> {
  if (!CLIENT) {
    throw new Error("Gql client not Initialized");
  }

  return CLIENT;
}
