import {DependencyList, useState} from "react";
import {useAsyncEffect} from "./useAsyncEffect";

export function useAsyncState<T>(effect: () => Promise<T>, deps: DependencyList): T | undefined {
  const [state, setState] = useState<T>();

  useAsyncEffect(async () => {
    setState(await effect());
  }, deps);

  return state;
}
