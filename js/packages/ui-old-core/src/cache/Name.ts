import {GqlCacheManager} from '@/gql';
import {IName} from '@/types';
import {CacheManager, ICacheEntry} from '@sui/lib-cache-abstract';

export class Name {
  public description?: string;
  public id: string;
  public name: string;

  public constructor(item: IName) {
    this.id = item.id;
    this.name = item.name;
    this.description = item.description;
  }
}

class _NameManager extends GqlCacheManager<IName, Name> {

  protected getFields(): string {
    return `
      id
      name
      description
    `;
  }

  protected getTableName(): string {
    return "name";
  }

  protected mapRawItem(item: IName): ICacheEntry<string, Name> {
    return {
      key: item.id,
      item: new Name(item)
    };
  }
}

export const NameManager: CacheManager<Name, string> = new _NameManager();
