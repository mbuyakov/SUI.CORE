import {DependencyList, useEffect} from "react";
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
