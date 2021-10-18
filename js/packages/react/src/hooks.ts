import {query} from "@sui/core";
import {DependencyList, useEffect, useMemo, useState} from "react";
import {Container} from "typescript-ioc";
import {errorNotification} from "./drawUtils";

export function useAsyncEffect(effect: () => Promise<void>, deps?: DependencyList) {
  useEffect(() => {
    effect().catch(e => {
      console.error(e);
      const errorMessage = e.response?.data?.message ?? e.stack ?? e.toString();
      errorNotification("Ошибка при обработки запроса", errorMessage);
    })
  }, deps);
}

export function useQuery<T>(queryBody: string | any, extractKeysLevel?: boolean | number, deps?: DependencyList): T {
  const [data, setData] = useState<T>();
  useAsyncEffect(async () => {
    const data  = await query<T>(queryBody, extractKeysLevel);
    setData(data);
  }, deps);
  return data;
}

export function useService<T>(source: Function & { prototype: T }): T {
  return useMemo(() => Container.get(source), []);
}
