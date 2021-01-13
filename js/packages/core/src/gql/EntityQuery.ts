import {PossibleId, PossibleValue} from "@/gql/types";
import autobind from "autobind-decorator";
import {generateMultiSelect, generateUpdate} from "@/gql/queryGenerator";
import {Logger} from "@/ioc";
import {addQuotesIfString} from "@/stringFormatters";
import {EventConsumerHandler, EventDispatcher, SuiEvent} from '@/event';


export class EntityQuery {
  private readonly entity: string;
  private id: PossibleId;

  private log: Logger;

  private dataMap: Map<string, PossibleValue> = new Map();
  private queue: string[] = [];
  private promiseMap: Map<string, Array<(value: PossibleValue) => void>> = new Map();
  private eventDispatcherMap: Map<string, EventDispatcher<"value">> = new Map();

  constructor(entity: string, id: PossibleId) {
    this.entity = entity;
    this.id = id;
    this.log = new Logger(`[EntityQuery]${entity}(id: ${addQuotesIfString(id)})`);
    this.log.info("Started");
  }

  public start(): NodeJS.Timeout {
    return setInterval(this.fetchData, 250);
  }

  public stop(): void {
    this.queue = [];
    [...this.eventDispatcherMap.values()].forEach(eventDispatcher => eventDispatcher.unsubscribeAll());
    this.eventDispatcherMap.clear();
    this.promiseMap.clear();
  }

  public changeId(id: PossibleId): void {
    this.log = new Logger(`[EntityQuery]${this.entity}(id: ${addQuotesIfString(id)})`);
    this.log.info(`Id changed (${this.id} -> ${id}`);
    const fields = new Set<string>();
    [...this.dataMap.keys()].forEach(fields.add);
    [...this.eventDispatcherMap.keys()].forEach(fields.add);
    [...this.promiseMap.keys()].forEach(fields.add);
    this.dataMap.clear();
    this.queue.push(...fields.values());
    this.id = id;
  }

  @autobind
  public async fetchData(): Promise<void> {
    const startId = this.id;
    if (this.queue.length > 0) {
      const keys = [...this.queue];
      this.log.info(["Fetch new data for", keys]);
      this.queue = [];
      const data = await generateMultiSelect(this.entity, this.id, keys);
      if (startId != this.id) {
        this.log.warn(["Fields", keys, "fetched for old ID"]);
        return;
      }
      Object.keys(data).forEach(key => {
        this.processNewFieldValue(key, data[key]);
      })
    }
  }

  private resolveOnFieldChange(field: string, resolve: (value: PossibleValue) => void): void {
    if (!this.promiseMap.has(field)) {
      this.promiseMap.set(field, [resolve]);
    } else {
      this.promiseMap.get(field)!.push(resolve);
    }
  }

  public subscribeOnFieldChange<T extends PossibleValue = PossibleValue>(field: string, callback: (value: T) => void, updateOnSubscribe: boolean = false): EventConsumerHandler<"value"> {
    if (!this.eventDispatcherMap.has(field)) {
      this.eventDispatcherMap.set(field, new EventDispatcher());
    }
    if (updateOnSubscribe) {
      this.queue.push(field);
    }
    return this.eventDispatcherMap.get(field)!.subscribe("value", (event) => callback(event.payload));
  }

  public async getFieldValue<T extends PossibleValue = PossibleValue>(field: string, forceUpdate: boolean = false): Promise<T> {
    return new Promise<T>(resolve => {
      if (this.dataMap.has(field) && !forceUpdate) {
        resolve(this.dataMap.get(field) as T);
      } else {
        this.queue.push(field);
        this.resolveOnFieldChange(field, resolve as (value: PossibleValue) => void);
      }
    });
  }

  private processNewFieldValue(field: string, value: PossibleValue): void {
    this.dataMap.set(field, value);
    this.promiseMap.get(field)?.forEach(resolve => resolve(value));
    this.promiseMap.delete(field);
    this.eventDispatcherMap.get(field)?.dispatch(new SuiEvent("value", value));
  }

  public async setFieldValue<T extends PossibleValue = PossibleValue>(field: string, value: T): Promise<void> {
    await generateUpdate(this.entity, this.id, field, value);
    // May be trigger after update in DB TODO: return new value from generateUpdate
    // this.processNewFieldValue(field, value);
    this.queue.push(field);
  }
}

