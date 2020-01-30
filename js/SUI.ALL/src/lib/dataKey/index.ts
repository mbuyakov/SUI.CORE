export type DataKey = number | string | Array<number | string> | null | undefined;

/**
 * Normalize data key to string array
 */
export function normalizeDataKey(key: DataKey): string[] {
  return Array.isArray(key) ? key as string[] : [key as string];
}

/**
 * Concat dataKeys to string array
 */
export function concatDataKey(...keys: DataKey[]): Array<number | string> {
  return keys
    .filter(value => value != null)
    .flatMap(key => key as string);
}

/**
 * Get data from object by DataKeys
 */
// tslint:disable-next-line:no-any
export function getDataByKey<T = any>(obj: any, ...keys: DataKey[]): T {
  const key = concatDataKey(...keys);
  if (key.length === 0) {
    return obj;
  }

  return key.reduce((prevValue, value) =>
      (prevValue && (prevValue[value] !== null || prevValue[value] !== undefined))
        ? prevValue[value]
        : null
    , obj);
}

/**
 * Tree node for DataKey
 */
export class DataKeyNode {
  /**
   * Key
   */
  public readonly key: string;

  /**
   * Children tree node
   */
  private readonly childs: DataKeyNode[] = [];

  public constructor(key: string) {
    this.key = key;
  }

  /**
   * Add child to tree node
   */
  public addChild(child: DataKeyNode): void {
    this.childs.push(child);
  }

  /**
   * Get child from node
   */
  public getChild(childKey: string): DataKeyNode | undefined {
    return this.childs.find(child => child.key === childKey);
  }

  /**
   * DataKeyNode to string (gql query)
   */
  public toString(): string {
    let ret = this.key;
    if (this.childs.length) {
      ret = `${ret} {
  ${this.childs.map(child => child.toString()).join(" \n")}
}`;
    }

    return ret;
  }
}

/**
 * Map DataKeys to tree (use to generate gql query)
 */
export function dataKeysToDataTree(dataKeys: DataKey[], rootKey: string = ""): DataKeyNode {
  // tslint:disable-next-line:completed-docs
  function appendKey(node: DataKeyNode, key: string[] | string): void {
    if (Array.isArray(key)) {
      if (key.length === 1) {
        // tslint:disable-next-line:no-parameter-reassignment
        key = key[0];
      }
      if (key.length === 0) {
        return;
      }
    }

    if (typeof key === "string") {
      node.addChild(new DataKeyNode(key));
    } else {
      const firstKey = key[0];
      let nextNode = node.getChild(firstKey);
      if (!nextNode) {
        nextNode = new DataKeyNode(firstKey);
        node.addChild(nextNode);
      }
      appendKey(nextNode, key.slice(1));
    }
  }

  const root = new DataKeyNode(rootKey);

  dataKeys
    .map(normalizeDataKey)
    .forEach(datakey => {
      appendKey(root, datakey);
    });

  return root;
}
