export interface ITabSyncerHandler<T> {
  cb: ITabSyncerHandlerCb<T>;
  id: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ITabSyncerHandlerCb<T> = (key: string, value?: T | null) => any;

export class TabSyncer<T> {

  private readonly handlers: Array<ITabSyncerHandler<T>> = [];
  private idCounter: number = 1;
  private readonly keyPrefix: string;

  public constructor(keyPrefix: string) {
    this.keyPrefix = keyPrefix;
    window.addEventListener("storage", e => {
      if ((typeof e.newValue === "string" && e.newValue === "DELETE") || (typeof e.oldValue === "string" && e.oldValue === "DELETE")) {
        return;
      }
      if (e.key && e.key.startsWith(`${this.keyPrefix}-`)) {
        const key = e.key.replace(`${this.keyPrefix}-`, "");
        const value = this.stringToT(e.newValue);
        this.handlers.forEach(handler => handler.cb(key, value));
      }
    });
  }

  public addHandler(cb: ITabSyncerHandlerCb<T>): number {
    const id = this.idCounter++;
    this.handlers.push({
      cb,
      id
    });

    return id;
  }


  public pushValue(key: string, value: T): void {
    this.handlers.forEach(handler => handler.cb(key, value));
    localStorage.setItem(`${this.keyPrefix}-${key}`, this.tToString(value));
    localStorage.setItem(`${this.keyPrefix}-${key}`, "DELETE");
    localStorage.removeItem(`${this.keyPrefix}-${key}`);
  }

  public removeHandler(id: number): void {
    // console.log(id, this.handlers);
    const index = this.handlers.findIndex(handler => handler.id === id);
    if (index < 0) {
      console.error(`Handler with id ${id} not found`);
    }
    this.handlers.splice(index, 1);
  }

  public stringToT(str: string | null): T | null {
    let t = null;
    try {
      t = str !== null ? JSON.parse(str) as T : null;
    } catch (e) {
      // Ignore
    }

    return t;
  }

  public tToString(t: T): string {
    return JSON.stringify(t);
  }
}
