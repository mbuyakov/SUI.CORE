import {NotFunction} from "@sui/util-types";

export type TOrCallback<T> = NotFunction<T> | (() => T);

export function getTOrCall<T>(value: TOrCallback<T>): T {
  return typeof value == "function" ? (value as (() => T))() : (value as T);
}
