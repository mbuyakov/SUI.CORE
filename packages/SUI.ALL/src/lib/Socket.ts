import {CompatClient, Stomp, StompHeaders} from "@stomp/stompjs";
import autobind from "autobind-decorator";
import { sleep } from './other';

const CONNECTED_AWAIT_TIMEOUT = 100;

interface ISocket {
  uri: string;

  // tslint:disable-next-line:no-any
  connect(client: CompatClient): any[];
}

export class Socket {

  private readonly props: ISocket;
  private stompClient: CompatClient | undefined;

  public constructor(props: ISocket) {
    this.props = props;
    this.init();
  }

  @autobind
  // tslint:disable-next-line:no-any
  public disconnect(callback?: any, headers?: StompHeaders): void {
    const client = this.stompClient;
    if (client) {
      this.stompClient = undefined;
      client.disconnect(callback, headers);
    }
  }

  @autobind
  public getClient(): CompatClient | undefined {
    return this.stompClient;
  }

  @autobind
  public init(): void {
    const stompClient = Stomp.client(this.props.uri);
    stompClient.connect(...this.props.connect(stompClient));
    this.stompClient = stompClient;
  }

  @autobind
  public isConnected(): boolean {
    return this.stompClient ? this.stompClient.connected : false;
  }

  @autobind
  // tslint:disable-next-line:no-any
  public async send(destination: string, headers?: { [name: string]: any }, body?: string): Promise<void> {
    if (this.stompClient) {
      while (!this.isConnected()) {
        await sleep(CONNECTED_AWAIT_TIMEOUT);
      }

      this.stompClient.send(destination, headers, body);
    }
  }

}
