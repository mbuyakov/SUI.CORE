import {SuiEvent} from "./SuiEvent";

export type SuiEventListener<T extends SuiEvent> = (event: T) => void | Promise<void>;

export interface EventListenerDescriptor {
  unsubscribe(): void;
}
