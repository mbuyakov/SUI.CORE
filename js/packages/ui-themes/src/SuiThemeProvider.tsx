import {ConfigProvider, ruRU} from "@sui/deps-antd";
import {ThemeProvider} from "@sui/deps-material";
import React, {useContext, useEffect, useState} from "react";
import {SuiThemeComponents, SuiThemeVariants} from "./types";
import {useHandler, useService} from "@sui/lib-hooks";
import {ThemeService} from "./ThemeService";
import {ThemeChangedEvent} from "./ThemeChangedEvent";
import {KludgeForStorybook} from "./KludgeForStorybook";

export const SuiThemeProvider: React.FC<{
  component: SuiThemeComponents | "base",
  children?: React.ReactNode
}> = ({
        component,
        children
      }) => {
  const themeService = useService(ThemeService);
  const theme = themeService.getCompiledTheme();
  const kludgeForStorybook: SuiThemeVariants | undefined = useContext(KludgeForStorybook);

  const [variant, setVariant] = useState(themeService.getCurrentTheme());

  useEffect(() => {
    if (kludgeForStorybook && kludgeForStorybook != variant) {
      themeService.setCurrentTheme(kludgeForStorybook);
    }
  }, [kludgeForStorybook]);

  useHandler(themeService.addHandler(ThemeChangedEvent, event => {
    setVariant(event.theme);
  }), []);
  const componentTheme = theme[variant][component];

  if (!componentTheme) {
    throw new Error(`No theme for component ${component} in ${variant} variant`);
  }
  return (
    <ConfigProvider
      locale={ruRU}
      theme={componentTheme.antd}
    >
      <ThemeProvider
        theme={componentTheme.mui}
      >
        {children}
      </ThemeProvider>
    </ConfigProvider>
  );
};
