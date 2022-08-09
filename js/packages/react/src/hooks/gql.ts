import {DependencyList, useState} from "react";
import {query} from "@sui/core";
import {useAsyncEffect} from "./async";

export function useQuery<T>(
  queryBody: string | any,
  extractKeysLevel?: boolean | number,
  deps: DependencyList = []
): T {
  const [data, setData] = useState<T>();
  useAsyncEffect(async () => {
    const data = await query<T>(queryBody, extractKeysLevel);
    setData(data);
  }, deps);
  return data;
}
