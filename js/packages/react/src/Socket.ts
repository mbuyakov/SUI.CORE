import {Client, IPublishParams, StompConfig} from "@stomp/stompjs";
import autobind from "autobind-decorator";
import { sleep } from '@sui/core';


const CONNECTED_AWAIT_TIMEOUT = 100;

export class Socket {

  private readonly config: StompConfig;
  private stompClient: Client;

  public constructor(config: StompConfig) {
    this.config = config;
    this.init();
  }

  @autobind
public disconnect(): void {
    const client = this.stompClient;
    if (client) {
      this.stompClient = undefined;
      client.deactivate();
    }
  }

  @autobind
  public getClient(): Client | undefined {
    return this.stompClient;
  }

  @autobind
  public init(): void {
    this.stompClient = new Client(this.config);
    this.stompClient.activate();
  }

  @autobind
  public isConnected(): boolean {
    return this.stompClient ? this.stompClient.connected : false;
  }

  @autobind
public async send(params: IPublishParams): Promise<void> {
    if (this.stompClient) {
      while (!this.isConnected()) {
        await sleep(CONNECTED_AWAIT_TIMEOUT);
      }

      this.stompClient.publish(params);
    }
  }

}
