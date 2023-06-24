import {addPluralEnding, addQuotesIfString, camelCase, capitalize} from "@/formatter/stringFormatters";
import { CacheManager, ICacheEntry } from "@sui/lib-cache-abstract";

import {query} from "./wrapper";

/**
 * Wrapper for quick create cache from PG table use Gql query
 */
export abstract class GqlCacheManager<GQL_ITEM, ITEM = GQL_ITEM, ID = string> extends CacheManager<ITEM, ID> {
  /**
   * Load all entries
   */
  protected async __loadAll(): Promise<Array<ICacheEntry<ID, ITEM>>> {
    const nodes = (await query<{ nodes: GQL_ITEM[] }>(
      `{
      all${capitalize(addPluralEnding(camelCase(this.getTableName())))} {
        nodes {
          ${this.getFields()}
        }
      }
    }`,
      true,
    )).nodes;

    return nodes.map(this.mapRawItem);
  }

  /**
   * Load one entry by id
   */
  protected async __loadById(id: ID): Promise<ITEM> {
    const node: GQL_ITEM = await query<GQL_ITEM>(
      `{
      ${camelCase(this.getTableName())}ById(id: ${addQuotesIfString(id) as string}) {
          ${this.getFields()}
      }
    }`,
      true,
    );

    return this.mapRawItem(node).item;
  }

  /**
   * Should return fields query
   * Must be implemented in CacheManager realisation
   */
  protected abstract getFields(): string;

  /**
   * Should return DB table name
   * Must be implemented in CacheManager realisation
   */
  protected abstract getTableName(): string;

  /**
   * Map raw item from DB to client type
   * Must be implemented in CacheManager realisation
   */
  protected abstract mapRawItem(item: GQL_ITEM): ICacheEntry<ID, ITEM>;
}
