import {DependencyList, useEffect, useState} from "react";
import {errorNotification} from "@/drawUtils";

export function useAsyncEffect(effect: () => Promise<void>, deps: DependencyList): void {
  useEffect(() => {
    effect().catch(e => {
      console.error(e);
      const errorMessage = e.response?.data?.message ?? e.stack ?? e.toString();
      errorNotification("Ошибка при обработке запроса", errorMessage);
    })
  }, deps);
}

export function useAsyncState<T>(effect: () => Promise<T>, deps: DependencyList): T | undefined {
  const [state, setState] = useState<T>();

  useAsyncEffect(async () => {
    setState(await effect());
  }, deps);

  return state;
}
