import {SuiModule} from "@sui/lib-module-manager";
import React from "react";
import {NotificationViewer} from "./NotificationViewer";

export class UiNotificationHandlerModule extends SuiModule {
  constructor() {
    super("UiNotificationHandlerModule", ["LibNotificationDispatcherModule"]);
  }

  modifyRoot(root: React.ReactNode): React.ReactNode {
    return React.createElement(NotificationViewer, {}, root);
  }
}
