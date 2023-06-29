import {Container, SingletonAndOnlyIoc} from "@sui/deps-ioc";
import {AccessRights, Privilege} from "./types";
import {ICoreUser} from "./user";
import {Nullable} from "@sui/util-types";
import {LocalStorageService} from "@sui/lib-storage";
import {UserNotInitializedError} from "./UserNotInitializedError";
import {NotificationDispatcher} from "@sui/lib-notification-dispatcher";
import axios from "axios";
import {sleep} from "@sui/util-chore";

const NOTIFICATION_KEY_USER_FORCIBLY_LOGOUT = "connect__USER_FORCIBLYLOGOUT_BY_IDLE_TIME";

abstract class UserService {
  public abstract getToken(): Nullable<string>;

  public abstract getUser<META = Record<string, never>>(): ICoreUser<META>;

  public abstract login(user: ICoreUser): void;

  public abstract logout(userCommand: boolean): void;

  public abstract isLoggedIn(): boolean;

  public abstract isAdmin(): boolean;

  public abstract hasRole(role: string): boolean;

  public abstract hasPrivilege(privilege: string): boolean;

  public abstract hasAnyPrivilege(...keys: string[]): boolean;

  public abstract getPrivileges<T extends object = object>(privilege: string): Privilege<T>[];

  public abstract setIsUserActive(isUserActive: boolean): void;
}

export class UserServiceImpl extends UserService {
  private readonly accessRights: AccessRights;
  private readonly restUrl = Container.getValue("sui.restUrl");
  private readonly token = Container.get(LocalStorageService).getKeyWrapper("token");
  private readonly notificationDispatcher = Container.get(NotificationDispatcher);
  private user: Nullable<ICoreUser>;
  private isUserActive = true;

  public constructor(accessRights: AccessRights) {
    super();
    this.accessRights = accessRights;
    (async () => {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (this.isLoggedIn()) {
          this.notificationDispatcher.close(NOTIFICATION_KEY_USER_FORCIBLY_LOGOUT);
        }
        if (this.isLoggedIn() && this.isUserActive) {
          try {
            const result = await axios.post<boolean>(
              `${this.restUrl}/api/token/check`,
              this.token.get(),
            );
            if (!result.data && this.isLoggedIn()) {
              // noinspection ES6MissingAwait
              this.logout(false);
              this.notificationDispatcher.warning("Ваш сеанс был автоматически завершен", null, {
                key: NOTIFICATION_KEY_USER_FORCIBLY_LOGOUT,
                duration: 0
              });
            }
          } catch (e) {
            console.error("Token check error", e);
            this.notificationDispatcher.warning("Ошибка при проверке токена", null, {
              key: "TOKEN_CHECK_ERROR_NOTIFICATION"
            });

            await sleep(1000);
          }
        }

        await sleep(1000);
      }
    })();
  }

  public override getToken(): Nullable<string> {
    return this.token.get();
  }

  public override getUser<META = Record<string, never>>(): ICoreUser<META> {
    if (!this.user) {
      throw new UserNotInitializedError();
    }

    return this.user as ICoreUser<META>;
  }

  public override login(user: ICoreUser) {
    this.token.set(user.accessToken);
    this.user = user;
    this.isUserActive = true;
  }

  public async logout(userCommand: boolean): Promise<void> {
    if (userCommand) {
      try {
        await axios.post<boolean>(
          `${this.restUrl}/api/auth/signout`,
          null,
          {headers: {Authorization: `Bearer ${this.token.get()}`}},
        );
        this.token.set(null);
        this.user = null;
        //TODO
        // getSUISettings().routerPushFn("/");
      } catch (e) {
        this.notificationDispatcher.handleError(e, "В процессе выхода произошла ошибка");
      }
    } else {
      this.token.set(null);
      this.user = null;
      //TODO
      // getSUISettings().routerPushFn("/");
    }
  }

  public override isLoggedIn(): boolean {
    return !!this.user;
  }

  public override isAdmin(): boolean {
    return this.hasRole("ADMIN");
  }

  public override hasRole(role: string): boolean {
    return this.getUser().roles.includes(role);
  }

  public override hasPrivilege(privilege: string): boolean {
    return this.getPrivileges(privilege).length > 0;
  }

  public override hasAnyPrivilege(...privilege: string[]): boolean {
    return privilege.some(it => this.hasPrivilege(it));
  }

  public override getPrivileges<T extends object = object>(privilege: string): Privilege<T>[] {
    return this.getUser()
      .roles
      .filter(it => !!this.accessRights[it])
      .flatMap(it => this.accessRights[it] as Privilege<T>[])
      .filter(it => it.key == privilege);
  }

  public override setIsUserActive(isUserActive: boolean) {
    this.isUserActive = isUserActive;
  }
}

const _UserService = SingletonAndOnlyIoc(UserService);
export {_UserService as UserService};
