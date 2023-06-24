import {Container} from "@sui/deps-ioc";
import {SuiModule} from "@sui/lib-module-manager";
import {NotificationDispatcher, NotificationDispatcherImpl} from "./NotificationDispatcher";

export class LibNotificationDispatcherModule extends SuiModule {
  constructor() {
    super("LibNotificationDispatcherModule");
    Container.bind(NotificationDispatcher).to(NotificationDispatcherImpl);
  }
}
