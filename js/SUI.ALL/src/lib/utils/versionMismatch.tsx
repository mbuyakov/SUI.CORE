/* tslint:disable:deprecation */

import { Button, notification } from 'antd';
import axios from 'axios';
import React from 'react';

let notifiedAboutVersionMismatch = false;
let checkVersionMismatchInterval: NodeJS.Timeout;

export function runCheckVersionMismatch(url: string): void {
  if (process.env.NODE_ENV === 'production') {
    function checkVersionMismatch(): void {
      // Timestamp to disable chrome disk cache
      axios.get(`${url}?timestamp=${new Date().getTime()}`).then(lastBuildTime => {
        if (lastBuildTime.data !== process.env.BUILD_TIME) {
          if (!notifiedAboutVersionMismatch) {
            notification.warn({
              duration: 0,
              message: (
                <div>
                  <div>Расхождение версий</div>
                  <div>Текущая версия: {process.env.BUILD_TIME}</div>
                  <div>Последняя версия: {lastBuildTime.data}</div>
                  <Button size="small" onClick={() => location.reload(true)}>Для обновления нажмите сюда</Button>
                  <div style={{ color: '#999', fontSize: 12 }}>(Ctrl+F5 для Windows)</div>
                  <div style={{ color: '#999', fontSize: 12 }}>(Cmd+Shift+R для MacOS)</div>
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
      }).catch(() => {/* Бывает, пофиг */});
    }

    // tslint:disable-next-line:no-magic-numbers
    checkVersionMismatchInterval = setInterval(checkVersionMismatch, 60000);
    checkVersionMismatch();
  }
}