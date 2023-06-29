import {SuiModule} from "@sui/lib-module-manager";
import {Container} from "@sui/deps-ioc";
import {UserService, UserServiceImpl} from "./UserService";
import {AccessRights} from "./types";

export class LibAuthModule extends SuiModule {
  private readonly accessRights: AccessRights;

  public constructor(accessRights: AccessRights) {
    super("LibAuthModule", ["LibStorageModule", "LibNotificationDispatcherModule"]);
    this.accessRights = accessRights;
  }

  override async init(): Promise<void> {
    const userService = new UserServiceImpl(this.accessRights);
    Container.bind(UserService).factory(() => userService);
  }
}
