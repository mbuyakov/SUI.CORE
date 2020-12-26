import {v4 as uuidv4} from 'uuid';
import {Nullable} from "@/other";
import {EventConsumer, EventConsumerHandler, EventFilter} from "./utils";
import { SuiEvent } from './SuiEvent';

class EnhancedEventConsumerHandler extends EventConsumerHandler {
  public eventName: Nullable<string>;
  public eventFilter: Nullable<EventFilter<never>>;
  public consumer: EventConsumer<never>;


  constructor(eventDispatcher: EventDispatcher, id: string, eventName: Nullable<string>, eventFilter: Nullable<(event: SuiEvent<never>) => boolean>, consumer: EventConsumer<never>) {
    super(eventDispatcher, id);
    this.eventName = eventName;
    this.eventFilter = eventFilter;
    this.consumer = consumer;
  }
}

export class EventDispatcher {
  private handlers: Map<string, EnhancedEventConsumerHandler> = new Map();

  public unsubscribeById(id: string): void {
    this.handlers.delete(id);
  }

  public unsubscribeAll(): void {
    // To remove ref on EventDispatcher
    [...this.handlers.values()].forEach(handler => {
      handler.eventDispatcher = null;
      handler.id = null;
    });
    this.handlers.clear();
  }

  public dispatch(event: SuiEvent<never>): void {
    [...this.handlers.values()].forEach(handler => {
      if (
        (handler.eventName && handler.eventName == event.name) ||
        (handler.eventFilter && handler.eventFilter(event))
      ) {
        handler.consumer(event);
      }
    })
  }

  public subscribe<T = never>(eventNameOrFilter: string | EventFilter<T>, consumer: EventConsumer<T>): EventConsumerHandler {
    const id = uuidv4();
    const eventName = typeof eventNameOrFilter === "string" ? eventNameOrFilter : null;
    const eventFilter = typeof eventNameOrFilter !== "string" ? eventNameOrFilter : null;

    const handler = new EnhancedEventConsumerHandler(this, id, eventName, eventFilter, consumer);
    this.handlers.set(id, handler);

    return handler;
  }
}
