import {EventManager} from "@sui/lib-event-manager";
import {CacheEntryUpdatedEvent} from "./CacheEntryUpdatedEvent";
import {sleep} from "@sui/util-chore";
import {ICacheEntry} from "./types";
import {Nullable} from "@sui/util-types";

const WAIT_TIME = 100;

export abstract class CacheManager<ITEM, ID = string> extends EventManager<CacheEntryUpdatedEvent<ID, ITEM>> {
  private readonly isCacheLoaded: Map<ID, boolean> = new Map();
  // TODO drop?
  private ready = false;
  private readonly cache: Map<ID, ITEM> = new Map();

  protected abstract __loadAll(): Promise<Array<ICacheEntry<ID, ITEM>>>;

  protected abstract __loadById(id: ID): Promise<ITEM>;

  public async containsById(id: ID): Promise<boolean> {
    return !!(await this.getById(id));
  }

  public async getById(id: ID): Promise<Nullable<ITEM>> {
    if (!this.isCacheLoaded.get(id)) {
      await this.reloadById(id);
    }
    return this.cache.get(id);
  }

  public directGetById(id: ID): Nullable<ITEM> {
    return this.cache.get(id);
  }

  public async reloadById(id: ID): Promise<void> {
    const item = await this.__loadById(id);
    this.set(id, item);
  }

  public async getAllValues(): Promise<ITEM[]> {
    while (!this.ready) {
      await sleep(WAIT_TIME);
    }

    return Array.from(this.cache.values());
  }

  public async loadAll(): Promise<void> {
    this.ready = false;
    this.isCacheLoaded.clear();
    this.cache.clear();
    const entries = await this.__loadAll();
    entries.forEach(entry => {
      this.isCacheLoaded.set(entry.key, true);
      this.cache.set(entry.key, entry.item);
    });
    this.ready = true;
  }

  private set(id: ID, item: ITEM): void {
    if (item == null) {
      this.cache.delete(id);
    } else {
      this.cache.set(id, item);
    }

    // noinspection JSIgnoredPromiseFromCall
    this.dispatch(CacheEntryUpdatedEvent, new CacheEntryUpdatedEvent<ID, ITEM>(id, item));
  }
}
