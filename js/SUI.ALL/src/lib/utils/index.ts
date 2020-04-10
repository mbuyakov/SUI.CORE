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

export function isAdmin(): boolean {
  return (getDataByKey(getUser(), "roles") || []).includes("ADMIN");
}

export function getUser(): ICoreUser {
  // tslint:disable-next-line:ban-ts-ignore
  // @ts-ignore
  return getDataByKey(window.g_app._store.getState(), ["user", "user"]);
}
