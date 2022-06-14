import merge from 'lodash/merge';
import {createMuiTheme, ThemeOptions} from '@material-ui/core/styles';

import {AntdThemeVars, CompiledThemes, PreCompiledTheme, SuiThemeConfig, ThemeAndOptions, ThemeOptionsGetter, ThemesConfig, ThemeVariant} from "@/themes/types";
import {defaultMuiTheme, defaultThemesConfig} from "@/themes/defaultThemesConfig";
import {getThemeVariables} from '@/antdMissedExport';

const lightAntdTheme = getThemeVariables({dark: false});
const darkAntdTheme = getThemeVariables({dark: true});

function prepareMuiTheme(base: ThemeAndOptions, options?: ThemeOptionsGetter): ThemeAndOptions {
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

function mergePreCompiledSuiTheme(base: PreCompiledTheme, theme?: SuiThemeConfig): PreCompiledTheme {
  const muiTheme = prepareMuiTheme(base.muiTheme, theme?.materialThemeConfig);
  const themeWithBaseBaseTable = prepareMuiTheme(muiTheme, base.baseTableMuiTheme.options);
  const themeWithBaseDrawer = prepareMuiTheme(muiTheme, base.drawerMaterialTheme.options);

  return {
    muiTheme,
    baseTableMuiTheme: prepareMuiTheme(themeWithBaseBaseTable, theme?.baseTableMaterialThemeConfig),
    drawerMaterialTheme: prepareMuiTheme(themeWithBaseDrawer, theme?.drawerMaterialThemeConfig)
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
  const defaultThemeAndOptions: ThemeAndOptions = {
    theme: defaultMuiTheme,
    options: {}
  };

  const commonBaseTheme = mergePreCompiledSuiTheme({
    muiTheme: defaultThemeAndOptions,
    baseTableMuiTheme: defaultThemeAndOptions,
    drawerMaterialTheme: defaultThemeAndOptions,
  }, defaultThemesConfig.common);
  const commonTheme = mergePreCompiledSuiTheme(commonBaseTheme, themes.common);

  const lightBaseTheme = mergePreCompiledSuiTheme(commonTheme, defaultThemesConfig.light);
  const lightTheme = mergePreCompiledSuiTheme(lightBaseTheme, themes.light);

  const darkBaseTheme = mergePreCompiledSuiTheme(commonTheme, defaultThemesConfig.dark);
  const darkTheme = mergePreCompiledSuiTheme(darkBaseTheme, themes.dark);

  const antdVars = getAntdVars(themes);

  return {
    light: {
      name: "light",
      muiTheme: lightTheme.muiTheme.theme,
      baseTableMuiTheme: lightTheme.baseTableMuiTheme.theme,
      drawerMaterialTheme: lightTheme.drawerMaterialTheme.theme,
      lessVars: antdVars.light,
    },
    dark: {
      name: "dark",
      muiTheme: darkTheme.muiTheme.theme,
      baseTableMuiTheme: darkTheme.baseTableMuiTheme.theme,
      drawerMaterialTheme: darkTheme.drawerMaterialTheme.theme,
      lessVars: antdVars.dark
    }
  }
}
