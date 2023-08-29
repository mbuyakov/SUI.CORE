import {SuiModule, SuiModuleWithSettings} from "@sui/lib-module-manager";
import {Container} from "@sui/deps-ioc";
import {UserService, UserServiceImpl} from "./UserService";
import {AccessRights} from "./types";
import {LibStorageModule} from "@sui/lib-storage";
import {LibNotificationDispatcherModule} from "@sui/lib-notification-dispatcher";

export class LibAuthModule extends SuiModuleWithSettings<AccessRights> {

  protected getName(): string {
    return "LibAuthModule";
  }

  override async init(): Promise<void> {
    const userService = new UserServiceImpl(this.settings);
    Container.bind(UserService).factory(() => userService);
  }

  protected override getDeps(): SuiModule[] {
    return [new LibStorageModule(), new LibNotificationDispatcherModule()];
  }
}
