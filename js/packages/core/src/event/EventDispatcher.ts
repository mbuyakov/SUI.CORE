import {v4 as uuidv4} from 'uuid';
import {Nullable} from "@/other";
import {EventConsumer, EventConsumerHandler, EventFilter} from "./utils";
import { SuiEvent } from './SuiEvent';

class EnhancedEventConsumerHandler<EVENT_NAME extends string, T> extends EventConsumerHandler<EVENT_NAME> {
  public eventName: Nullable<EVENT_NAME>;
  public eventFilter: Nullable<EventFilter<EVENT_NAME, T>>;
  public consumer: EventConsumer<EVENT_NAME, T>;


  constructor(eventDispatcher: EventDispatcher<EVENT_NAME>, id: string, eventName: Nullable<EVENT_NAME>, eventFilter: Nullable<EventFilter<EVENT_NAME, T>>, consumer: EventConsumer<EVENT_NAME, T>) {
    super(eventDispatcher, id);
    this.eventName = eventName;
    this.eventFilter = eventFilter;
    this.consumer = consumer;
  }
}

export class EventDispatcher<EVENT_NAME extends string = string> {
  private handlers: Map<string, EnhancedEventConsumerHandler<EVENT_NAME, unknown>> = new Map();

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

  public dispatch(event: SuiEvent<EVENT_NAME, unknown>): void {
    [...this.handlers.values()].forEach(handler => {
      if (
        (handler.eventName && handler.eventName == event.name) ||
        (handler.eventFilter && handler.eventFilter(event))
      ) {
        handler.consumer(event);
      }
    })
  }

  public subscribe<T = never>(eventNameOrFilter: EVENT_NAME | EventFilter<EVENT_NAME, T>, consumer: EventConsumer<EVENT_NAME, T>): EventConsumerHandler<EVENT_NAME> {
    const id = uuidv4();
    const eventName = typeof eventNameOrFilter === "string" ? eventNameOrFilter : null;
    const eventFilter = typeof eventNameOrFilter !== "string" ? eventNameOrFilter : null;

    const handler = new EnhancedEventConsumerHandler(this, id, eventName, eventFilter, consumer);
    this.handlers.set(id, handler as EnhancedEventConsumerHandler<EVENT_NAME, unknown>);

    return handler;
  }
}
