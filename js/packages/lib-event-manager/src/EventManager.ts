import {v4 as uuidv4} from "uuid";
import {EventListenerDescriptor, SuiEventListener} from "./types";
import {SuiEvent} from "./SuiEvent";
import {Class} from "@sui/util-types";


export class EventManager<T extends SuiEvent> {
  private handlers: Map<typeof SuiEvent, Map<string, SuiEventListener<never>>> = new Map();

  public addHandler<E extends T>(eventType: Class<E>, listener: SuiEventListener<E>): EventListenerDescriptor {
    let handlersByType = this.handlers.get(eventType);
    if (handlersByType == null) {
      handlersByType = new Map();
      this.handlers.set(eventType, handlersByType);
    }

    const id = uuidv4();
    handlersByType.set(id, listener);
    return {
      unsubscribe(): void {
        handlersByType?.delete(id);
      }
    }
  }

  public dispatch<E extends T>(eventType: Class<E>, event: E): Promise<void[]> {
    const listeners = Array.from(this.handlers.get(eventType)?.values() ?? []);
    return Promise.all(listeners.map(it => it(event as never)));
  }
}
