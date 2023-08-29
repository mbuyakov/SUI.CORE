import {SuiModule, SuiModuleWithSettings} from "@sui/lib-module-manager";
import {SuiThemeCompiled, SuiThemeConfig} from "./types";
import {compileFinalTheme} from "./themeMerger";
import {suiDefaultTheme} from "./defaultTheme";
import React from "react";
import {SuiThemeProvider} from "./SuiThemeProvider";
import {Container} from "@sui/deps-ioc";
import {ThemeService, ThemeServiceImpl} from "./ThemeService";
import {CssBaseline} from "@sui/deps-material";
import {LibStorageModule} from "@sui/lib-storage";

export class UiThemesModule extends SuiModuleWithSettings<SuiThemeConfig> {
  private compiledTheme?: SuiThemeCompiled;

  protected getName(): string {
    return "UiThemesModule";
  }

  protected getDeps(): SuiModule[] {
    return [new LibStorageModule()];
  }

  async init(): Promise<void> {
    await super.init();
    this.compiledTheme = compileFinalTheme(suiDefaultTheme, this.settings);
    const themeServiceImpl = new ThemeServiceImpl(this.compiledTheme);
    Container.bind(ThemeService).factory(() => themeServiceImpl);
  }

  modifyRoot(root: React.ReactNode): React.ReactNode {
    return React.createElement(
      SuiThemeProvider,
      {
        component: "base",
      },
      React.createElement(CssBaseline),
      root
    );
  }
}
