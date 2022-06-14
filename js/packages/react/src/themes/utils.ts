import merge from 'lodash/merge';
import {createMuiTheme, Theme} from '@material-ui/core/styles';

import {AntdTheme, AntdThemeVars, CompiledTheme, CompiledThemeBase, CompiledThemes, CompiledThemeWithoutAntd, SuiThemeConfig, ThemeOptionsGetter, ThemesConfig, ThemeVariant} from "@/themes/types";
import {defaultMuiTheme, defaultThemesConfig} from "@/themes/defaultThemesConfig";
import {getThemeVariables} from '@/antdMissedExport';

const lightAntdTheme = getThemeVariables({dark: false});
const darkAntdTheme = getThemeVariables({dark: true});

function getMuiTheme(baseTheme: Theme, options?: ThemeOptionsGetter): Theme {
  if (!options) {
    return defaultMuiTheme;
  }

  if (typeof options == 'function') {
    return createMuiTheme(options(baseTheme));
  }
  return createMuiTheme(options);
}

function compileSuiTheme(theme: SuiThemeConfig, base: CompiledThemeBase): CompiledThemeWithoutAntd {
  const muiTheme = getMuiTheme(base.muiTheme, theme.materialThemeConfig);
  return {
    name: base.name,
    muiTheme,
    baseTableMuiTheme: getMuiTheme(muiTheme, theme.baseTableMaterialThemeConfig),
    drawerMaterialTheme: getMuiTheme(muiTheme, theme.drawerMaterialThemeConfig)
  }
}

export function getAntdVars(themes: ThemesConfig): {
  [theme in ThemeVariant]: AntdThemeVars
} {
  return {
    light: merge({}, lightAntdTheme, themes.common.lessVars, themes.light.lessVars),
    dark: merge({}, lightAntdTheme, themes.common.lessVars, themes.dark.lessVars),
  }
}

export function getCompiledThemes(themes: ThemesConfig): CompiledThemes {
  const antdVars = getAntdVars(themes);
  const commonBaseTheme = compileSuiTheme(defaultThemesConfig.common, {
    // Stub
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    name: "common",
    lessVars: {},
    muiTheme: defaultMuiTheme
  });
  const commonTheme = compileSuiTheme(themes.common, commonBaseTheme);

  const lightBaseTheme = compileSuiTheme(defaultThemesConfig.light, {
    ...commonTheme,
    name: "light",
  });
  const lightTheme = compileSuiTheme(themes.light, lightBaseTheme);

  const darkBaseTheme = compileSuiTheme(defaultThemesConfig.dark, {
    ...commonTheme,
    name: "dark",
  });
  const darkTheme = compileSuiTheme(themes.dark, darkBaseTheme);

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
