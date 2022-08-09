import React from 'react';
import {Button, notification} from 'antd';
import axios from 'axios';
import {getSUISettings, IObjectWithIndex} from '@sui/core';

let notifiedAboutVersionMismatch = false;
let checkVersionMismatchInterval: NodeJS.Timeout;

export function runCheckVersionMismatch(currentVersion: string): void {
  if (process.env.NODE_ENV === 'production') {
    function checkVersionMismatch(): void {
      // Timestamp to disable chrome disk cache
      axios.get(`${getSUISettings().checkVersionMismatchUrl}?timestamp=${new Date().getTime()}`)
        .then((lastBuildTime): void => {
          if (lastBuildTime.data !== currentVersion) {
            if (!notifiedAboutVersionMismatch) {
              notification.warn({
                duration: 0,
                message: (
                  <div>
                    <div>Расхождение версий</div>
                    <div>Текущая версия: {currentVersion}</div>
                    <div>Последняя версия: {lastBuildTime.data}</div>
                    <Button size="small" onClick={(): void => location.reload(true)}>Для обновления нажмите сюда</Button>
                    <div style={{color: '#999', fontSize: 12}}>(Ctrl+F5 для Windows)</div>
                    <div style={{color: '#999', fontSize: 12}}>(Cmd+Shift+R для MacOS)</div>
                  </div>
                ),
              });
              notifiedAboutVersionMismatch = true;
              if (checkVersionMismatchInterval) {
                clearInterval(checkVersionMismatchInterval);
                checkVersionMismatchInterval = null;
              }
            }
          }
        })
        .catch((): void => {/* Бывает, пофиг */
        });
    }

    checkVersionMismatchInterval = setInterval(checkVersionMismatch, 60000);
    checkVersionMismatch();
  }
}

//Костыль для вызова этой балалайки в init из core
(window as IObjectWithIndex).runCheckVersionMismatch = runCheckVersionMismatch;
