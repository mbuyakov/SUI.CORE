import { message, notification } from "antd";
import * as React from "react";

const MESSAGE_TIMEOUT = 3;

/**
 * Draw error notification about data loading
 */
export function loadingErrorNotification(descr: JSX.Element | string): void {
  errorNotification("Ошибка при загрузке данных", descr);
}

/**
 * Draw error notification
 */
export function errorNotification(messageText: string, description: string | React.ReactNode): void {
  notification.error({
    description,
    message: messageText,
    style: { width: 500, marginLeft: -100 },
  });
}

/**
 * Draw loading message
 */
export async function loadingMessage<T>(promise: Promise<T>, loadingText: string, errorText: string, successText: string, delay: number = 500): Promise<T> {
  let hideMsg: () => void;
  const timeout = setTimeout(() => {
    hideMsg = message.loading(loadingText, 0);
  }, delay);

  hideMsg = () => {
    clearTimeout(timeout);
  };

  try {
    const promiseRet = await promise;
    hideMsg();
    message.success(successText, MESSAGE_TIMEOUT);

    return promiseRet;
  } catch (e) {
    console.error("LOADING FAILED", e);
    hideMsg();
    message.error(errorText, MESSAGE_TIMEOUT);
    throw e;
  }
}
