/*eslint sort-exports/sort-exports: 2*/
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
export * from "./versionMismatch";

export function getUser(): ICoreUser {
// @ts-ignore
  return window.g_app && window.g_app._store && getDataByKey(window.g_app._store.getState(), ["user", "user"]);
}

export function isAdmin(): boolean {
  return (getDataByKey(getUser(), "roles") || []).includes("ADMIN");
}
