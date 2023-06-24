import {useMemo} from "react";
import {Container} from "@sui/deps-ioc";

// eslint-disable-next-line @typescript-eslint/ban-types
export function useService<T>(source: Function & { prototype: T }): T {
  return useMemo(() => Container.get(source), []);
}

