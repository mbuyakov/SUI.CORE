import React from "react";
import axios from "axios";
import {getSUISettings, IObjectWithIndex, sleep, UserService} from "@sui/ui-old-core";
import {Container} from "typescript-ioc";
import {NotificationDispatcher} from "@sui/lib-notification-dispatcher";

export function checkVersionMismatch(): Promise<false | { newVersion: string }> {
  if (process.env.NODE_ENV !== "production") {
    return Promise.resolve(false);
  }

  // Timestamp to disable chrome disk cache
  return axios.get(`${getSUISettings().checkVersionMismatchUrl}?timestamp=${new Date().getTime()}`)
    .then(response => (response.data !== getCurrentVersion()) ? {newVersion: response.data} : false)
    .catch((): false => false);
}

export function showVersionMismatchNotification(newVersion: string, isLoggedIn: boolean): void {
  Container.get(NotificationDispatcher).warning(
    "Установлена новая версия системы",
    (
      <div>
        <div>Текущая версия: {getCurrentVersion()}</div>
        <div>Последняя версия: {newVersion}</div>
        {!isLoggedIn && (<div>Пожалуйста, обновите страницу</div>)}
        {isLoggedIn && (<div>У вас есть минута на сохранение данных и выход из системы</div>)}
        <div style={{color: "#999", fontSize: 12}}>(Ctrl+F5 для Windows)</div>
        <div style={{color: "#999", fontSize: 12}}>(Cmd+Shift+R для MacOS)</div>
      </div>
    ),
    {
      key: "__SUI_VERSION_MISMATCH_NOTIFICATION_KEY",
      duration: 0,
      style: {width: isLoggedIn ? 600 : 450},
    });
}

export function runCheckVersionMismatch(): void {
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
          const updated = (await checkVersionMismatch()) === false;

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
      .catch((): void => {/* Бывает, пофиг */
      });
  }

  setTimeout(checkVersionMismatchIteration, 1000);
  setInterval(checkVersionMismatchIteration, 20000);
}

function getCurrentVersion(): string {
  return getSUISettings().buildTime;
}

//Костыль для вызова этой балалайки в init из core
(window as IObjectWithIndex).runCheckVersionMismatch = runCheckVersionMismatch;
