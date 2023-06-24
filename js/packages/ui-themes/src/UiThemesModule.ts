import {SuiModule} from "@sui/lib-module-manager";
import {SuiThemeCompiled, SuiThemeConfig} from "./types";
import {compileFinalTheme} from "./themeMerger";
import {suiDefaultTheme} from "./defaultTheme";
import React from "react";
import {SuiThemeProvider} from "./SuiThemeProvider";
import {Container} from "@sui/deps-ioc";
import {ThemeService, ThemeServiceImpl} from "./ThemeService";
import {CssBaseline} from "@sui/deps-material";

export class UiThemesModule extends SuiModule {
  private compiledTheme?: SuiThemeCompiled;
  private readonly themeConfig: SuiThemeConfig;

  constructor(themeConfig: SuiThemeConfig) {
    super("UiThemesModule", ["LocalStorageModule"]);
    this.themeConfig = themeConfig;
    Container.bind(ThemeService).to(ThemeServiceImpl);
  }

  async init(): Promise<void> {
    await super.init();
    this.compiledTheme = compileFinalTheme(suiDefaultTheme, this.themeConfig);
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
