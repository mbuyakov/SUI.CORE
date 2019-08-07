import ApolloClient from "apollo-client";

declare let window: Window & {
  /**
   * Variable for global client instance
   */
  SUI_CORE_CLIENT: ApolloClient<{}> | undefined;
};

/**
 * Must be call before use Gql wrappers
 */
export function init(clientInstance: ApolloClient<{}>): void {
  window.SUI_CORE_CLIENT = clientInstance;
}

/**
 * Get client instance
 */
export function getClient(): ApolloClient<{}> {
  if (!window.SUI_CORE_CLIENT) {
    throw new Error("Gql client not Initialized");
  }

  return window.SUI_CORE_CLIENT;
}
