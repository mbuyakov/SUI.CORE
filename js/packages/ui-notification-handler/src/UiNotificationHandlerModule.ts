import {SuiModule} from "@sui/lib-module-manager";
import React from "react";
import {NotificationViewer} from "./NotificationViewer";
import {LibNotificationDispatcherModule} from "@sui/lib-notification-dispatcher";

export class UiNotificationHandlerModule extends SuiModule {

  modifyRoot(root: React.ReactNode): React.ReactNode {
    return React.createElement(NotificationViewer, {}, root);
  }

  protected getName(): string {
    return "UiNotificationHandlerModule";
  }


  protected getDeps(): SuiModule[] {
    return [new LibNotificationDispatcherModule()];
  }
}
