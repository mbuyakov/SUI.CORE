import {IObjectWithIndex} from '@sui/core';

export const MESSAGE_ID_KEY = '__messageId';

export abstract class BackendDataSource {

  protected readonly onMessage: (body: IObjectWithIndex) => void;
  protected readonly onOpen: () => void;

  protected constructor(onOpen: () => void, onMessage: (body: IObjectWithIndex) => void) {
    this.onOpen = onOpen;
    this.onMessage = onMessage;
  }

  public abstract disconnect(): void;

  public abstract getSessionId(): string

  public abstract init(): Promise<boolean>;

  public abstract send<T>(messageId: string, body?: T, headers?: IObjectWithIndex): Promise<void>;

}
