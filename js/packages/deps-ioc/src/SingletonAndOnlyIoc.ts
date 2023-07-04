// eslint-disable-next-line no-restricted-imports
import {Container, OnlyInstantiableByContainer, Scope} from "typescript-ioc";

// eslint-disable-next-line @typescript-eslint/ban-types
export function SingletonAndOnlyIoc<T extends Function>(target: T): T {
  Container.bind(target).scope(Scope.Singleton);
  return OnlyInstantiableByContainer(target);
}
