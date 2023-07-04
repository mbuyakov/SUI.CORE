import {SuiModule} from "@sui/lib-module-manager";
import React from "react";
import {IdleTracker} from "./IdleTracker";
import {Container} from "@sui/deps-ioc";
import {UserService} from "@sui/lib-auth";

export class UiIdleTrackerModule extends SuiModule {
  private readonly timeout: number;
  constructor(timeout: number) {
    super("UiIdleTrackerModule", ["LibAuth"]);
    this.timeout = timeout;
  }


  modifyRoot(root: React.ReactNode): React.ReactNode {
    const userService = Container.get(UserService);
    return React.createElement(
      IdleTracker,
      {
        timeout: this.timeout,
        onIdle: () => userService.setIsUserActive(false),
        onActive: () => userService.setIsUserActive(true)
      },
      root
    );
  }
}
