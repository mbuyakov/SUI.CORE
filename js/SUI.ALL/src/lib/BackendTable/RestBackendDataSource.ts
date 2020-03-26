// tslint:disable:no-async-without-await
import axios from "axios";
import uuid from 'uuid/v4';

import {IObjectWithIndex} from "../other";
import {getBackendUrl, getUser} from "../utils";

import {BackendDataSource, MESSAGE_ID_KEY} from "./BackendDataSource";

export class RestBackendDataSource extends BackendDataSource {

  private initSessionId: string;

  public constructor(onOpen: () => void, onMessage: (body: IObjectWithIndex) => void) {
    super(onOpen, onMessage);
  }

  public disconnect(): void {
    this.__send("DISCONNECT", {"Content-Type": "text/plain"})
      .then(() => console.log(`RestBackendDataSource were closed for session: ${this.initSessionId}`))
      .catch((reason) => {
        // log and ignore
        console.error(reason);
      });
  }

  public async init(): Promise<boolean> {
    this.initSessionId = uuid();
    this.onOpen();

    return new Promise<boolean>((resolve): void => resolve(true));
  }

  public async send<T>(messageId: string, body: T, headers?: IObjectWithIndex): Promise<void> {
    // do not await;
    // tslint:disable-next-line:no-floating-promises
    this.__send(body, headers).then(data => this.onMessage({
      ...data,
      [MESSAGE_ID_KEY]: messageId
    }));
  }

  private async __send<T>(body: T, headers?: IObjectWithIndex): Promise<IObjectWithIndex> {
    return axios.post(
      `${location.protocol}//${getBackendUrl()}-http`,
      body,
      {
        headers: {
          ...headers,
          Authorization: `Bearer ${getUser().accessToken}`,
          initSessionId: this.initSessionId
        }
      }
    )
      .then(value => value.data)
      .catch(reason => {
        console.error(reason);

        return {type: "ERROR", message: "Ошибка, подробное описание в консоли Вашего браузера"};
      });
  }

}
