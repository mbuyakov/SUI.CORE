import {useMemo} from "react";
import {Container} from "@sui/deps-ioc";

export function useService<T>(source: Function & { prototype: T }): T {
  return useMemo(() => Container.get(source), []);
}

export function useValue<T>(name: string): T {
  return useMemo(() => Container.getValue(name), []);
}
