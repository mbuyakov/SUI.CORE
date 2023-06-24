import {SuiEvent} from "@sui/lib-event-manager";

export class CacheEntryUpdatedEvent<ID, ITEM> extends SuiEvent {
  public readonly id: ID;
  public readonly item: ITEM;

  constructor(id: ID, item: ITEM) {
    super("CacheEntryUpdatedEvent");
    this.id = id;
    this.item = item;
  }
}
