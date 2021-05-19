import {IObjectWithIndex, IUser, query, toMap} from "@sui/core";
import axios, {AxiosRequestConfig} from "axios";

// noinspection ES6PreferShortImport
import {errorNotification} from "../drawUtils";
// noinspection ES6PreferShortImport
import {getUser} from "../utils";

import {IAuditLogTableRow} from "./AuditLogTable";

function formatConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      Authorization: `Bearer ${getUser().accessToken}`,
      ...config?.headers
    }
  };
}

export function fetchTablesWithAuditLogs(url: string, config?: AxiosRequestConfig): Promise<string[]> {
  return axios.get(url, formatConfig(config))
    .then(async (response) => (response.data || []).map(String))
    .catch(reason => {
      console.error("Fetch tables with audit log error", reason);
      errorNotification(
        "Ошибка при получении списка таблиц с логами аудита",
        "Подробное описание ошибки смотрите в консоли вашего браузера"
      );
      return [];
    });
}

export function fetchAndFormatAuditLog(url: string, config?: AxiosRequestConfig): Promise<IAuditLogTableRow[]> {
  return axios.get(url, formatConfig(config))
    .then(async (response) => {
      const rows = (response.data || []) as IObjectWithIndex[];

      const userMap = toMap(
        await query<IUser[]>(`{ allUsers { nodes { id name } } }`, 2),
        user => String(user.id)
      );

      rows.reverse().forEach((row, index) => {
        row.id = index;
        row.userName = userMap.get(String(row.userId))?.name
      });

      return rows as IAuditLogTableRow[];
    })
    .catch(reason => {
      console.error("Audit table fetch data error", reason);
      errorNotification(
        "Ошибка при получении данных для таблицы аудита",
        "Подробное описание ошибки смотрите в консоли вашего браузера"
      );
      return [];
    });
}
