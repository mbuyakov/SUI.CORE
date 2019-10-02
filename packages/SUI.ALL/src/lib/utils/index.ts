import { getDataByKey } from '../dataKey';
import { ICoreUser } from '../user';

export * from "./actionType";
export * from "./condition";
export * from "./draggable";
export * from "./draw";
export * from "./filterType";
export * from "./init";
export * from "./metaInfo";
export * from "./metaUtils";
export * from "./TabSyncer";

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
