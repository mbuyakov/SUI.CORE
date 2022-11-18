import React from "react";
import {Button, notification} from "antd";
import axios from "axios";
import {getSUISettings, IObjectWithIndex, sleep, UserService} from "@sui/core";
import {Container} from "typescript-ioc";

function checkVersionMismatch(currentVersion: string): Promise<false | { newVersion: string }> {
  // Timestamp to disable chrome disk cache
  return axios.get(`${getSUISettings().checkVersionMismatchUrl}?timestamp=${new Date().getTime()}`)
    .then(response => (response.data !== currentVersion) ? {newVersion: response.data} : false)
    .catch((): false => false);
}

function showVersionMismatchNotification(currentVersion: string, newVersion: string, isLoggedIn: boolean): void {
  notification.warn({
    duration: 0,
    message: (
      <div>
        <div>Установлена новая версия системы</div>
        <div>Текущая версия: {currentVersion}</div>
        <div>Последняя версия: {newVersion}</div>
        {isLoggedIn && (<div>Если в течение минуты Вы не обновитесь, то Вас автоматически разлогинит</div>)}
        <Button size="small" onClick={(): void => location.reload(true)}>Для обновления нажмите сюда</Button>
        <div style={{color: '#999', fontSize: 12}}>(Ctrl+F5 для Windows)</div>
        <div style={{color: '#999', fontSize: 12}}>(Cmd+Shift+R для MacOS)</div>
      </div>
    ),
  });
}

export function runCheckVersionMismatch(currentVersion: string): void {
  const userService = Container.get(UserService);

  let logoutInProgress = false;

  function checkVersionMismatchIteration(): void {
    checkVersionMismatch(currentVersion)
      .then(async (checkVersionMismatchResult): Promise<void> => {
        if (!checkVersionMismatchResult) {
          return;
        }

        const newVersion = checkVersionMismatchResult.newVersion;
        const isLoggedIn = userService.isLoggedIn();

        showVersionMismatchNotification(currentVersion, newVersion, isLoggedIn);

        if (!isLoggedIn || logoutInProgress) {
          return;
        }

        logoutInProgress = true;

        try {
          // Ждем минуту
          await sleep(60000);

          // Определяем обновился ли пользователь
          const updated = await checkVersionMismatch(currentVersion) === false;

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

  checkVersionMismatchIteration();

  setInterval(checkVersionMismatchIteration, 60000);
}

//Костыль для вызова этой балалайки в init из core
(window as IObjectWithIndex).runCheckVersionMismatch = runCheckVersionMismatch;
