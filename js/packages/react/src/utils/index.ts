/* eslint-disable no-console,@typescript-eslint/no-explicit-any */
import {Container} from 'typescript-ioc';
import {getDataByKey, ICoreUser, IObjectWithIndex, UserService} from '@sui/core';
import {notification} from "antd";


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


declare global {
  const cordova: any;
}

function errorWhileSaving(e: Error | string | IObjectWithIndex): void {
  notification.error({
    message: "Ошибка при сохранении файла",
    description: e instanceof Error ? e.message : (typeof e === "string" ? e : JSON.stringify(e))
  })
}


function createFile(dirEntry: any, blob: Blob, fileName: string): void {
  // Creates a new file
  dirEntry.getFile(fileName, {create: true, exclusive: false}, (fileEntry) => {
    writeFile(fileEntry, blob, fileName);
  }, errorWhileSaving);
}

function writeFile(fileEntry: any, blob: Blob, fileName: string): void {
  // Create a FileWriter object for our FileEntry
  fileEntry.createWriter(fileWriter => {
    fileWriter.onerror = errorWhileSaving;
    fileWriter.onwriteend = (): void => {
      notification.success({
        message: "Файл сохранён",
        description: `Файл с именем ${fileName} успешно добавлен в папку "Загрузки"`
      })
    }
    fileWriter.write(blob);
  })
}

function saveBlob2File(blob: Blob, fileName: string): void {
  const folder = `${cordova.file.externalRootDirectory}Download`;
  // @ts-ignore
  window.resolveLocalFileSystemURL(folder, (dirEntry) => {
    console.log(`file system open: ${dirEntry.name}`);
    createFile(dirEntry, blob, fileName);
  }, errorWhileSaving)
}

export function downloadFile(file: Blob, fileName: string): void {
  if (typeof cordova !== 'undefined' && cordova.platformId !== "browser") {
    saveBlob2File(file, fileName);
  } else {
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
  }
}

export function getUser(): ICoreUser {
  return Container.get(UserService).getUser();
}

export function isAdmin(): boolean {
  return (getDataByKey(getUser(), "roles") || []).includes("ADMIN");
}
