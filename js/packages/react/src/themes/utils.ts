import merge from 'lodash/merge';
import {createMuiTheme, Theme} from '@material-ui/core/styles';

import {AntdTheme, AntdThemeVars, CompiledTheme, CompiledThemeBase, CompiledThemes, CompiledThemeWithoutAntd, SuiThemeConfig, ThemeOptionsGetter, ThemesConfig, ThemeVariant} from "@/themes/types";
import {defaultMuiTheme, defaultThemesConfig} from "@/themes/defaultThemesConfig";
import {getThemeVariables} from '@/antdMissedExport';

const lightAntdTheme = getThemeVariables({dark: false});
const darkAntdTheme = getThemeVariables({dark: true});

function getMuiTheme(baseTheme: Theme, options?: ThemeOptionsGetter): Theme {
  if (!options) {
    return baseTheme;
  }

  if (typeof options == 'function') {
    return createMuiTheme(options(baseTheme));
  }
  return createMuiTheme(options);
}

function compileSuiTheme(base: CompiledThemeBase, theme?: SuiThemeConfig): CompiledThemeWithoutAntd {
  const muiTheme = getMuiTheme(base.muiTheme, theme?.materialThemeConfig);
  return {
    name: base.name,
    muiTheme,
    baseTableMuiTheme: getMuiTheme(muiTheme, theme?.baseTableMaterialThemeConfig),
    drawerMaterialTheme: getMuiTheme(muiTheme, theme?.drawerMaterialThemeConfig)
  }
}

export function getAntdVars(themes: ThemesConfig): {
  [theme in ThemeVariant]: AntdThemeVars
} {
  return {
    light: merge({}, lightAntdTheme, themes.common?.lessVars ?? {}, themes.light?.lessVars ?? {}),
    dark: merge({}, darkAntdTheme, themes.common?.lessVars ?? {}, themes.dark?.lessVars ?? {}),
  }
}

export function getCompiledThemes(themes: ThemesConfig): CompiledThemes {
  const antdVars = getAntdVars(themes);
  const commonBaseTheme = compileSuiTheme({
    // Stub
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    name: "common",
    lessVars: {},
    muiTheme: defaultMuiTheme
  }, defaultThemesConfig.common);
  const commonTheme = compileSuiTheme(commonBaseTheme, themes.common);

  const lightBaseTheme = compileSuiTheme({
    ...commonTheme,
    name: "light",
  }, defaultThemesConfig.light);
  const lightTheme = compileSuiTheme(lightBaseTheme, themes.light);

  const darkBaseTheme = compileSuiTheme({
    ...commonTheme,
    name: "dark",
  }, defaultThemesConfig.dark);
  const darkTheme = compileSuiTheme(darkBaseTheme, themes.dark);

  return {
    light: {
      ...lightTheme,
      lessVars: antdVars.light,
    },
    dark: {
      ...darkTheme,
      lessVars: antdVars.dark
    }
  }
}
