import { sleep } from "./other";

const WAIT_TIME: number = 100;

export type CacheHandler<ID, T> = (id: ID, item: T | null) => void;

/**
 * Cache entry
 */
export interface ICacheEntry<T, ID> {
  // tslint:disable-next-line:completed-docs
  key: ID;
  // tslint:disable-next-line:completed-docs
  value: T;
}

/**
 * Abstract class for create client caches
 */
export abstract class CacheManager<T, ID = string> {

  /**
   * Stores load status
   */
  private readonly loadedStore: Map<ID, boolean> = new Map();

  /**
   * Is instance ready
   */
  private ready: boolean = false;

  /**
   * Client store
   */
  private readonly store: Map<ID, T> = new Map();

  /**
   * Id generator for subscribers
   */
  private subscribersCounter: number = 0;

  /**
   * Stores all subscribers
   */
  private readonly subscribersStore: Map<number, CacheHandler<ID, T>> = new Map();

  /**
   * Return entity by id
   * If entity not in cache - return undefined
   */
  public directGetById(id: ID): T | undefined {
    return this.store.get(id);
  }

  /**
   * Return all entries from cache
   */
  public async getAllValues(): Promise<T[]> {
    while (!this.ready) {
      await sleep(WAIT_TIME);
    }

    return Array.from(this.store.values());
  }

  /**
   * Return entry by id
   * If entity not in cache - load
   */
  public async getById(id: ID): Promise<T> {
    while (!this.ready) {
      await sleep(WAIT_TIME);
    }

    await this.loadById(id);

    return this.store.get(id);
  }

  /**
   * Load all entries to cache. If use in already loaded CacheManager - reload all entries
   */
  public async loadAll(): Promise<void> {
    this.ready = false;
    this.loadedStore.clear();
    this.store.forEach((_, id) => {
      this.set(id, null);
    });
    const entries = await this.__loadAll();
    entries.forEach(entry => {
      this.set(entry.key, entry.value);
      this.loadedStore.set(entry.key, true);
    });
    this.ready = true;
  }

  /**
   * Load entity in cache by id
   */
  public async loadById(id: ID): Promise<void> {
    if (!this.loadedStore.get(id)) {
      const item = await this.__loadById(id);
      this.set(id, item);
      this.loadedStore.set(id, true);
    }
  }

  /**
   * Recreate entity by id
   */
  public async reloadById(id: ID): Promise<void> {
    this.loadedStore.set(id, false);
    await this.loadById(id);
  }

  /**
   * Subscibe to update in cache
   */
  public subscribe(handler: CacheHandler<ID, T>): number {
    // tslint:disable-next-line:increment-decrement
    const id = this.subscribersCounter++;
    this.subscribersStore.set(id, handler);

    return id;
  }

  /**
   * Remove subscibe handler
   */
  public unsubscibe(id: number): void {
    this.subscribersStore.delete(id);
  }

  /**
   * Load all entries to cache
   * Must be implemented in CacheManager realisation
   */
  protected abstract async __loadAll(): Promise<Array<ICacheEntry<T, ID>>>;

  /**
   * Load entry to cache
   * Must be implemented in CacheManager realisation
   */
  protected abstract async __loadById(id: ID): Promise<T>;

  /**
   * Set value and notify subscribers
   */
  private set(id: ID, item: T | null): void {
    if (item == null) {
      this.store.delete(id);
    } else {
      this.store.set(id, item);
    }

    this.subscribersStore.forEach((handler) => {
      try {
        handler(id, item);
      } catch (e) {
        console.error("Exception in CacheManager subscribe handler");
        console.error(e);
      }
    });
  }
}
