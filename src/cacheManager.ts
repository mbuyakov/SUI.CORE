import { sleep } from "@/other";

const WAIT_TIME: number = 100;

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
   * Return all entries from cache
   */
  public async getAllValues(): Promise<T[]> {
    while (!this.ready) {
      await sleep(WAIT_TIME);
    }

    return [...this.store.values()];
  }

  /**
   * Return entry by id
   */
  public async getById(id: ID): Promise<T | undefined> {
    while (!this.ready) {
      await sleep(WAIT_TIME);
    }

    this.loadById(id);

    return this.store.get(id);
  }

  /**
   * Load all entries to cache. If use in already loaded CacheManager - reload all entries
   */
  public async loadAll(): Promise<void> {
    this.ready = false;
    this.loadedStore.clear();
    this.store.clear();
    const entries = await this.__loadAll();
    entries.forEach(entry => {
      this.store.set(entry.key, entry.value);
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
      this.store.set(id, item);
      this.loadedStore.set(id, true);
    }
  }

  /**
   * Recreate entity by id
   */
  public async reloadById(id: ID): Promise<void> {
    this.loadedStore.set(id, false);
    this.loadById(id);
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
}
