import merge from 'lodash/merge';
import {createMuiTheme, Theme} from '@material-ui/core/styles';

import {CompiledTheme, CompiledThemeBase, CompiledThemes, SuiThemeConfig, ThemeOptionsGetter, ThemesConfig} from "@/themes/types";
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

function compileSuiTheme(theme: SuiThemeConfig, base: CompiledThemeBase): CompiledTheme {
  const muiTheme = getMuiTheme(base.muiTheme, theme.materialThemeConfig);
  return {
    name: base.name,
    lessVars: merge({}, base.lessVars, theme.lessVars),
    muiTheme,
    baseTableMuiTheme: getMuiTheme(muiTheme, theme.baseTableMaterialThemeConfig),
    drawerMaterialTheme: getMuiTheme(muiTheme, theme.drawerMaterialThemeConfig)
  }
}

export function getCompiledThemes(themes: ThemesConfig): CompiledThemes {
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
    lessVars: merge({}, lightAntdTheme, commonTheme.lessVars)
  });
  const lightTheme = compileSuiTheme(themes.light, lightBaseTheme);

  const darkBaseTheme = compileSuiTheme(defaultThemesConfig.dark, {
    ...commonTheme,
    name: "dark",
    lessVars: merge({}, darkAntdTheme, commonTheme.lessVars)
  });
  const darkTheme = compileSuiTheme(themes.dark, darkBaseTheme);

  return {
    light: lightTheme,
    dark: darkTheme
  }
}
