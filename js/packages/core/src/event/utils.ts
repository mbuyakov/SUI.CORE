import {EventDispatcher} from "@/event/EventDispatcher";
import {Nullable} from "@/other";
import {SuiEvent} from "@/event/SuiEvent";

export type EventConsumer<EVENT_NAME extends string, T> = (event: SuiEvent<EVENT_NAME, T>) => void;

export type EventFilter<EVENT_NAME extends string, T> = (event: SuiEvent<EVENT_NAME, T>) => boolean;

export class EventConsumerHandler<EVENT_NAME extends string = string> {
  public eventDispatcher: Nullable<EventDispatcher<EVENT_NAME>>;
  public id: Nullable<string>;

  constructor(eventDispatcher: EventDispatcher<EVENT_NAME>, id: string) {
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
