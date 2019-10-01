import ApolloClient from "apollo-client";


declare let window: Window & {
  /**
   * Variable for global client instance
   */
  SUI_CORE_GQL_CLIENT: ApolloClient<{}> | undefined;
};

/**
 * Must be call before use Gql wrappers
 */
export function initGql(clientInstance: ApolloClient<{}>): void {
  window.SUI_CORE_GQL_CLIENT = clientInstance;
}

/**
 * Get client instance
 */
export function getGqlClient(): ApolloClient<{}> {
  if (!window.SUI_CORE_GQL_CLIENT) {
    throw new Error("Gql client not initialized");
  }

  return window.SUI_CORE_GQL_CLIENT;
}
