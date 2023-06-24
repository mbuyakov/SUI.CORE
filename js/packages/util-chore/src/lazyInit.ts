import {Nullable} from "@sui/util-types";

export function lazyInit<T>(initializer: () => T): () => T {
  let instance: Nullable<T> = null;
  return () => {
    if (instance == null) {
      instance = initializer();
    }
    return instance;
  }
}
