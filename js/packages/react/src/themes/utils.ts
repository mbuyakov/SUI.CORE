import merge from 'lodash/merge';
import {createMuiTheme, ThemeOptions} from '@material-ui/core/styles';
import {Nullable} from "@sui/core";
import {AntdThemeVars, CompiledThemes, SuiThemeConfig, ThemeAndOptions, ThemeOptionsGetter, ThemesConfig, ThemeVariant} from "@/themes/types";
import {defaultMuiTheme, defaultThemesConfig} from "@/themes/defaultThemesConfig";
import {getThemeVariables} from '@/antdMissedExport';

const lightAntdTheme = getThemeVariables({dark: false});
const darkAntdTheme = getThemeVariables({dark: true});

/* antd theme merging magic
* ------------ LIGHT
* default antd light theme
* + common SUI defaultTheme
*   + common project SUI theme
*     + light SUI defaultTheme
*       + light project SUI theme
* ------------ DARK
* default antd dark theme
* + common SUI defaultTheme
*   + common project SUI theme
*     + dark SUI defaultTheme
*       + dark project SUI theme
*/
export function getAntdVars(themes: ThemesConfig): {
  [theme in ThemeVariant]: AntdThemeVars
} {
  return {
    light: merge(
      {},
      lightAntdTheme,
      defaultThemesConfig.common?.lessVars ?? {},
      themes.common?.lessVars ?? {},
      defaultThemesConfig.light?.lessVars ?? {},
      themes.light?.lessVars ?? {}
    ),
    dark: merge(
      {},
      darkAntdTheme,
      defaultThemesConfig.common?.lessVars ?? {},
      themes.common?.lessVars ?? {},
      defaultThemesConfig.dark?.lessVars ?? {},
      themes.dark?.lessVars ?? {}
    ),
  }
}

function mergeMuiTheme(base: ThemeAndOptions, options?: ThemeOptionsGetter): ThemeAndOptions {
  if (!options) {
    return base;
  }

  let newOptions: ThemeOptions;
  if (typeof options == 'function') {
    newOptions = options(base.theme);
  } else {
    newOptions = options;
  }

  newOptions = merge({}, base.options, newOptions);

  return {
    theme: createMuiTheme(newOptions),
    options: newOptions
  };
}

function mergeMuiThemes(base: ThemeAndOptions, options: Nullable<ThemeOptionsGetter>[]): ThemeAndOptions {
  return options
    .filter(Boolean)
    .reduce<ThemeAndOptions>((prev, cur) => mergeMuiTheme(prev, cur), base);
}

function getArrayForCustom(themes: ThemesConfig, variant: ThemeVariant, customName: keyof Omit<SuiThemeConfig, 'lessVars' | 'materialThemeConfig'>): Nullable<ThemeOptionsGetter>[] {
  return [
    defaultThemesConfig[variant]?.materialThemeConfig,
    themes[variant]?.materialThemeConfig,
    defaultThemesConfig.common?.[customName],
    themes.common?.[customName],
    defaultThemesConfig[variant]?.[customName],
    themes[variant]?.[customName],
  ];
}

/* MUI theme merging magic
* default MUI theme
* + common SUI defaultTheme
*   + common project SUI theme
* ------------ CUSTOM (baseTable, drawer)
*   | + (color) common SUI defaultTheme
*   |   + (color) common project SUI theme
*   |     + CUSTOM common SUI defaultTheme
*   |       + CUSTOM common project SUI theme
*   |         + (color) CUSTOM SUI defaultTheme
*   |           + (color) CUSTOM project SUI theme
* ------------ COLOR
*   | + COLOR SUI defaultTheme
*   |   + COLOR project SUI
*/
export function getCompiledThemes(themes: ThemesConfig): CompiledThemes {
  const common = mergeMuiThemes({
    theme: defaultMuiTheme,
    options: {}
  }, [
    defaultThemesConfig.common?.materialThemeConfig,
    themes.common?.materialThemeConfig
  ]);

  const light = mergeMuiThemes(common, [
    defaultThemesConfig.light?.materialThemeConfig,
    themes.light?.materialThemeConfig
  ]);
  const lightBT = mergeMuiThemes(common, getArrayForCustom(themes, "light", "baseTableMaterialThemeConfig"));
  const lightD = mergeMuiThemes(common, getArrayForCustom(themes, "light", "drawerMaterialThemeConfig"));

  const dark = mergeMuiThemes(common, [
    defaultThemesConfig.dark?.materialThemeConfig,
    themes.dark?.materialThemeConfig
  ]);
  const darkBT = mergeMuiThemes(common, getArrayForCustom(themes, "dark", "baseTableMaterialThemeConfig"));
  const darkD = mergeMuiThemes(common, getArrayForCustom(themes, "dark", "drawerMaterialThemeConfig"));

  const antdVars = getAntdVars(themes);

  return {
    light: {
      name: "light",
      muiTheme: light.theme,
      baseTableMuiTheme: lightBT.theme,
      drawerMaterialTheme: lightD.theme,
      lessVars: antdVars.light,
    },
    dark: {
      name: "dark",
      muiTheme: dark.theme,
      baseTableMuiTheme: darkBT.theme,
      drawerMaterialTheme: darkD.theme,
      lessVars: antdVars.dark
    }
  }
}
