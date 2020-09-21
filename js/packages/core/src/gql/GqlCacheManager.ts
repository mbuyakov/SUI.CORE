import { CacheManager, ICacheEntry } from "@/cacheManager";
import { addPluralEnding, addQuotesIfString, camelCase, capitalize } from "@/stringFormatters";

import { query } from "./wrapper";

/**
 * Wrapper for quick create cache from PG table use Gql query
 */
export abstract class GqlCacheManager<GQL_T, T = GQL_T, ID = string> extends CacheManager<T, ID> {
  /**
   * Load all entries
   */
  protected async __loadAll(): Promise<Array<ICacheEntry<T, ID>>> {
const nodes = (await query<{ nodes: GQL_T[] }>(
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
  protected async __loadById(id: ID): Promise<T> {
    const node: GQL_T = await query<GQL_T>(
      `{
      ${camelCase(this.getTableName())}ById(id: ${addQuotesIfString(id) as string}) {
          ${this.getFields()}
      }
    }`,
      true,
    );

    return this.mapRawItem(node).value;
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
  protected abstract mapRawItem(item: GQL_T): ICacheEntry<T, ID>;
}
