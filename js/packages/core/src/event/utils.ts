import {EventDispatcher} from "@/event/EventDispatcher";
import {Nullable} from "@/other";
import {SuiEvent} from "@/event/SuiEvent";

export type EventConsumer<T> = (event: SuiEvent<T>) => never;

export type EventFilter<T> = (event: SuiEvent<T>) => boolean;

export class EventConsumerHandler {
  public eventDispatcher: Nullable<EventDispatcher>;
  public id: Nullable<string>;

  constructor(eventDispatcher: EventDispatcher, id: string) {
    this.eventDispatcher = eventDispatcher;
    this.id = id;
  }

  public unsubscribe(): void {
    if (!this.id) {
      console.warn("Event handled already unsubscribed");
      return;
    }
    this.eventDispatcher!.unsubscribeById(this.id);
    // WeakRef not available in current version of JS :(
    this.eventDispatcher = null;
    this.id = null;
  }
}
