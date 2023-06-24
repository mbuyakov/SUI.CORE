import {Container} from "@sui/deps-ioc";
import {DependencyList, useEffect} from "react";
import {NotificationDispatcher} from "@sui/lib-notification-dispatcher";

export function useAsyncEffect(effect: () => Promise<void>, deps: DependencyList): void {
  useEffect(() => {
    effect().catch(e => {
      console.error(e);
      Container.get(NotificationDispatcher).handleError(e);
    })
  }, deps);
}

