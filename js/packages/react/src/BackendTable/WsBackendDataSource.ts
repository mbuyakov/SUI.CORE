import {IFrame, StompConfig} from '@stomp/stompjs';
import {getSUISettings, IObjectWithIndex, Logger, sleep } from "@sui/core";

// noinspection ES6PreferShortImport
import {Socket} from '../Socket';
// noinspection ES6PreferShortImport
import {getUser} from '../utils';

import {BackendDataSource, MESSAGE_ID_KEY} from './BackendDataSource';


const SEND_DESTINATION = '/data';

const log = new Logger("WsBackendDataSource");

const maximizeLogConfig: Partial<StompConfig> = {
  debug: (msg): void => log.debug(msg),
  logRawCommunication: true,
  onDisconnect: (frame): void => log.debug(['onDisconnect', frame]),
  onStompError: (frame): void => log.debug(['onStompError', frame]),
  onUnhandledFrame: (frame): void => log.debug(['onUnhandledFrame', frame]),
  onUnhandledMessage: (message): void => log.debug(['onUnhandledMessage', message]),
  onUnhandledReceipt: (frame): void => log.debug(['onUnhandledReceipt', frame]),
  onWebSocketClose: (closeEvent): void => log.debug(['onWebSocketClose', closeEvent]),
  onWebSocketError: (event): void => log.debug(['onWebSocketError', event]),
};

const SUBSCRIBE_DESTINATION_PREFIX = '/user/queue/response/';
const RECONNECT_DELAY = 50;
const MAX_RECONNECT_ATTEMPTS = 3;

export class WsBackendDataSource extends BackendDataSource {

  private connectAttempts: number;
  private initialSessionId: string;
  private socket: Socket;

  public constructor(onOpen: () => void, onMessage: (body: IObjectWithIndex) => void) {
    super(onOpen, onMessage);
    this.connectAttempts = 0;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public getSessionId(): string {
    return this.initialSessionId;
  }

  public async init(): Promise<boolean> {
    const backendURL = new URL(`ws${location.protocol === 'https:' ? 's' : ''}://${getSUISettings().backendUrl}`);
    log.debug(backendURL);

    this.socket = new Socket({
      ...maximizeLogConfig,
      brokerURL: backendURL.toString(),
      connectHeaders: {Authorization: `Bearer ${getUser().accessToken}`},
      onConnect: (frame: IFrame): void => {
        const alreadyInitiated = !!this.initialSessionId;
        const client = this.socket.getClient();

        log.debug(client);

        if (!alreadyInitiated) {
          this.initialSessionId = frame.body;
        }

        client.subscribe(
          `${SUBSCRIBE_DESTINATION_PREFIX}${this.initialSessionId}`,
          (message): void => this.onMessage(JSON.parse(message.body)),
        );

        if (!alreadyInitiated) {
          this.onOpen();
        }

        // Add new parameter to connection URL for reconnection
        backendURL.searchParams.set('previousSessionId', frame.body);
        client.brokerURL = backendURL.toString();
      },
      onWebSocketClose: (config): void => {
        if (maximizeLogConfig.onWebSocketClose) {
          maximizeLogConfig.onWebSocketClose(config);
        }
        this.connectAttempts++;
      },
      reconnectDelay: RECONNECT_DELAY,
    });

    while (this.connectAttempts < MAX_RECONNECT_ATTEMPTS && !this.socket.isConnected()) {
      await sleep(25);
    }

    return this.socket.isConnected();
  }

  public async send<T>(messageId: string, body?: T, headers?: IObjectWithIndex): Promise<void> {
    return this.socket.send({
      body: body ? JSON.stringify(body) : null,
      destination: SEND_DESTINATION,
      headers: {
        ...headers,
        [MESSAGE_ID_KEY]: messageId,
      },
    });
  }

}
