import {SuiModule, SuiModuleWithSettings} from "@sui/lib-module-manager";
import React from "react";
import {IdleTracker} from "./IdleTracker";
import {Container} from "@sui/deps-ioc";
import {LibAuthModule, UserService} from "@sui/lib-auth";

export type IdleTrackerSettings = {
  timeout: number
};

export class UiIdleTrackerModule extends SuiModuleWithSettings<IdleTrackerSettings> {


  protected getDeps(): SuiModule[] {
    return [new LibAuthModule(undefined as never)];
  }

  modifyRoot(root: React.ReactNode): React.ReactNode {
    const userService = Container.get(UserService);
    return React.createElement(
      IdleTracker,
      {
        timeout: this.settings.timeout,
        onIdle: () => userService.setIsUserActive(false),
        onActive: () => userService.setIsUserActive(true)
      },
      root
    );
  }

  protected getName(): string {
    return "UiIdleTrackerModule";
  }
}
