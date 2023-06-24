import {useMemo} from "react";
import {Container} from "@sui/deps-ioc";
export function useValue<T>(name: string): T {
  return useMemo(() => Container.getValue(name), []);
}
