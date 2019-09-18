import { getDataByKey, ICoreUser } from '@smsoft/sui-core';

export * from "./plugins";
export * from "./BackendTable";
export * from "./Socket";

declare let window: Window & {
  SUI_BACKEND_URL: string | undefined;
};


export function initBackend(backendUrl: string): void {
  window.SUI_BACKEND_URL = backendUrl;
}

export function getBackendUrl(): string {
  if (!window.SUI_BACKEND_URL) {
    throw new Error("Backend not initialized");
  }

  return window.SUI_BACKEND_URL;
}

export function isAdmin(): boolean {
  return (getDataByKey(getUser(), "roles") || []).includes("ADMIN");
}

export function getUser(): ICoreUser {
  // tslint:disable-next-line:ban-ts-ignore
  // @ts-ignore
  return getDataByKey(window.g_app._store.getState(), ["user", "user"]);
}
