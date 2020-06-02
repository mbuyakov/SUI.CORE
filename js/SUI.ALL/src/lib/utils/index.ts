/*eslint sort-exports/sort-exports: 2*/
import { Container } from 'typescript-ioc';
import { getDataByKey } from '../dataKey';
import { ICoreUser } from '../user';
import { UserService } from '../ioc/service';

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
  return Container.get(UserService).getUser();
}

export function isAdmin(): boolean {
  return (getDataByKey(getUser(), "roles") || []).includes("ADMIN");
}
