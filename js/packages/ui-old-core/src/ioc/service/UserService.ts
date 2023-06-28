import {Container, Singleton} from "typescript-ioc";
import axios from "axios";
import {Nullable, sleep} from "@/other";
import {ICoreUser} from "@/user";
import {getSUISettings} from "@/core";
import {NotificationDispatcher} from "@sui/lib-notification-dispatcher";

// Don't touch import
// noinspection ES6PreferShortImport
import {_LocalStorageValue} from "../annotation/LocalStorageValue";
// noinspection ES6PreferShortImport
import {Logger} from "../utils";
// eslint-disable-next-line import/order
import {UserNotInitializedError} from "@/errors";


export const USER_FORCIBLY_LOGOUT_MSG = "Ваш сеанс был автоматически завершен.";
const NOTIFICATION_KEY_USER_FORCIBLY_LOGOUT = "connect__USER_FORCIBLYLOGOUT_BY_IDLE_TIME";

@Singleton
export class UserService<META = Record<string, never>> {
  private notificationDispatcher = Container.get(NotificationDispatcher);

  private token = _LocalStorageValue("token");

  private restUri: string = Container.getValue("sui.restUri");

  private log = new Logger("UserService");

  private user: Nullable<ICoreUser<META>>;

  private tokenCheckerRunning = true;

  public setTokenCheckerRunning(value: boolean): void {
    this.tokenCheckerRunning = value;
  }

  public getToken(): Nullable<string> {
    return this.token.get();
  }

  public getUser(): ICoreUser<META> {
    if (this.user == null) {
      throw new UserNotInitializedError();
    }
    return this.user;
  }

  public isLoggedIn(): boolean {
    return !!this.user;
  }

  public login(user: ICoreUser<META>): void {
    this.token.set(user.accessToken);
    this.user = user;

    // noinspection JSIgnoredPromiseFromCall
    this.runTokenChecker();
  }

  private async runTokenChecker(): Promise<void> {
    this.log.info("Start token checker");

    while (this.isLoggedIn()) {
      // @ts-ignore
      notification.close(NOTIFICATION_KEY_USER_FORCIBLY_LOGOUT);

      if (this.tokenCheckerRunning) {
        try {
          const result = await axios.post<boolean>(
            `${this.restUri}/api/token/check`,
            this.token.get(),
          );
          if (!result.data && this.isLoggedIn()) {
            // noinspection ES6MissingAwait
            this.logout(false);

            // @ts-ignore
            notification.warn({key: NOTIFICATION_KEY_USER_FORCIBLY_LOGOUT, message: USER_FORCIBLY_LOGOUT_MSG, duration: 0});
          }
        } catch (reason) {
          this.log.error(reason, "Token check error");
          // @ts-ignore
          notification.warn({
            message: "Ошибка при проверке токена",
            key: "TOKEN_CHECK_ERROR_NOTIFICATION"
          });
          await sleep(1000);
        }
      } else {
        await sleep(1000);
      }
    }
    this.log.info("Token checker stopped due to logout");
  }

  public async logout(userCommand: boolean): Promise<void> {
    if (userCommand) {
      try {
        await axios.post<boolean>(
          `${this.restUri}/api/auth/signout`,
          null,
          {headers: {Authorization: `Bearer ${this.token.get()}`}},
        );
        this.token.set(null);
        this.user = null;
        getSUISettings().routerPushFn("/");
      } catch (e) {
        this.log.error(e, "Logout error");
        // @ts-ignore
        notification.warn({message: "В процессе выхода произошла ошибка"});
      }
    } else {
      this.token.set(null);
      this.user = null;
      getSUISettings().routerPushFn("/");
    }
  }
}
