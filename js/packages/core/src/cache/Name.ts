import { GqlCacheManager } from '@/gql';
import { IName } from '@/types';
import { ICacheEntry } from './cacheManager';

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

  protected mapRawItem(item: IName): ICacheEntry<Name, string> {
    return {
      key: item.id,
      value: new Name(item)
    };
  }
}

export const NameManager = new _NameManager();
