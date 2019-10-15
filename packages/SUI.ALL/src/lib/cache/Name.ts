import { ICacheEntry } from '../cacheManager';
import { GqlCacheManager } from '../gql';
import { IName } from '../types';

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

// tslint:disable-next-line:max-classes-per-file class-name
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

// tslint:disable-next-line:variable-name
export const NameManager = new _NameManager();