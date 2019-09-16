import { getDataByKey, IUser } from '@smsoft/sui-core';

export * from "./Socket";

declare let window: Window & {
  /**
   * Variable for global client instance
   */
  SUI_BACKEND_URL: string | undefined;
};

/**
 * Must be call before use Gql wrappers
 */
export function initBackend(clientInstance: string): void {
  window.SUI_BACKEND_URL = clientInstance;
}

/**
 * Get client instance
 */
export function getBackendUrl(): string {
  if (!window.SUI_BACKEND_URL) {
    throw new Error("Backend not initialized");
  }

  return window.SUI_BACKEND_URL;
}

export function isAdmin(): boolean {
  return (getDataByKey(getUser, "roles") || []).includes("ADMIN");
}

export function getUser(): IUser {
  // tslint:disable-next-line:ban-ts-ignore
  // @ts-ignore
  return getDataByKey(window.g_app._store.getState(), ["user", "user"]);
}
