import {Container} from "@sui/deps-ioc";
import {SuiModule} from "@sui/lib-module-manager";
import {NotificationDispatcher, NotificationDispatcherImpl} from "./NotificationDispatcher";

export class LibNotificationDispatcherModule extends SuiModule {
  protected getName(): string {
    return "LibNotificationDispatcherModule";
  }

  override async init(): Promise<void> {
    Container.bind(NotificationDispatcher).to(NotificationDispatcherImpl);
  }
}
