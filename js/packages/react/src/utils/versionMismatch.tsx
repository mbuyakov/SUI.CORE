import React from "react";
import {notification} from "antd";
import axios from "axios";
import {getSUISettings, IObjectWithIndex, sleep, UserService} from "@sui/core";
import {Container} from "typescript-ioc";

export function checkVersionMismatch(): Promise<false | { newVersion: string }> {
  // Timestamp to disable chrome disk cache
  return axios.get(`${getSUISettings().checkVersionMismatchUrl}?timestamp=${new Date().getTime()}`)
    .then(response => (response.data !== getCurrentVersion()) ? {newVersion: response.data} : false)
    .catch((): false => false);
}

export function showVersionMismatchNotification(newVersion: string, isLoggedIn: boolean): void {
  notification.warn({
    key: "__SUI_VERSION_MISMATCH_NOTIFICATION_KEY",
    duration: 0,
    style: {width: isLoggedIn ? 600 : 450},
    message: "Установлена новая версия системы",
    description: (
      <div>
        <div>Текущая версия: {getCurrentVersion()}</div>
        <div>Последняя версия: {newVersion}</div>
        {!isLoggedIn && (<div>Пожалуйста, обновите страницу</div>)}
        {isLoggedIn && (<div>У вас есть минута на сохранение данных и выход из системы</div>)}
        <div style={{color: '#999', fontSize: 12}}>(Ctrl+F5 для Windows)</div>
        <div style={{color: '#999', fontSize: 12}}>(Cmd+Shift+R для MacOS)</div>
      </div>
    )
  });
}

export function runCheckVersionMismatch(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const userService = Container.get(UserService);

  let logoutInProgress = false;

  function checkVersionMismatchIteration(): void {
    checkVersionMismatch()
      .then(async (checkVersionMismatchResult): Promise<void> => {
        if (!checkVersionMismatchResult || logoutInProgress || !userService.isLoggedIn()) {
          return;
        }

        const newVersion = checkVersionMismatchResult.newVersion;

        showVersionMismatchNotification(newVersion, true);

        logoutInProgress = true;

        try {
          // Ждем минуту
          await sleep(60000);

          // Определяем обновился ли пользователь
          const updated = await checkVersionMismatch() === false;

          // Разлогиниваем, если не обновился
          if (!updated) {
            await userService.logout(false);
          }
        } catch (e) {
          console.error("Unable logout in runCheckVersionMismatch");
        } finally {
          logoutInProgress = false;
        }
      })
      .catch((): void => {/* Бывает, пофиг */});
  }

  setTimeout(checkVersionMismatchIteration, 1000);
  setInterval(checkVersionMismatchIteration, 20000);
}

function getCurrentVersion(): string {
  return getSUISettings().buildTime;
}

//Костыль для вызова этой балалайки в init из core
(window as IObjectWithIndex).runCheckVersionMismatch = runCheckVersionMismatch;
