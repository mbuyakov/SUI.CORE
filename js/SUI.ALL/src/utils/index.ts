import { Container } from 'typescript-ioc';

import { getDataByKey } from '../dataKey';
import { ICoreUser } from '../user';
import { UserService } from '../ioc/service';

export * from "./actionType";
export * from "./condition";
export * from "./draggable";
export * from "./draw";
export * from "./filterType";
export * from "./formUtils";
export * from "./init";
export * from "./location";
export * from "./array";
export * from "./metaInfo";
export * from "./metaUtils";
export * from "./TabSyncer";
export * from "./versionMismatch";

export function downloadFile(file: Blob, fileName: string): void {
  const element = document.createElement('a');
  element.href = URL.createObjectURL(file);
  element.download = fileName;
  document.body.appendChild(element);
  element.click();
}

export function getUser(): ICoreUser {
  return Container.get(UserService).getUser();
}

export function isAdmin(): boolean {
  return (getDataByKey(getUser(), "roles") || []).includes("ADMIN");
}
