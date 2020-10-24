import merge from 'lodash/merge';
import {createMuiTheme} from '@material-ui/core/styles';
import {getThemeVariables} from 'antd/dist/theme';

import {CompiledThemes, MergedThemeConfigs, SuiThemeConfig, ThemesConfig} from "@/themes/types";
import {defaultTheme} from "@/themes/defaultTheme";

const lightAntdTheme = getThemeVariables({dark: false});
const darkAntdTheme = getThemeVariables({dark: true});

export function getMergedThemeConfigs(themes: ThemesConfig): MergedThemeConfigs {
  const commonTheme: SuiThemeConfig = merge({}, defaultTheme.common, themes.common);
  const lightTheme: SuiThemeConfig = merge({}, defaultTheme.light, themes.light);
  const darkTheme: SuiThemeConfig = merge({}, defaultTheme.dark, themes.dark);

  const commonWithLightTheme: SuiThemeConfig = merge({
    lessVars: lightAntdTheme
  }, commonTheme, lightTheme);
  const commonWithDarkTheme: SuiThemeConfig = merge({
    lessVars: darkAntdTheme
  }, commonTheme, darkTheme);

  return {
    commonWithLightTheme,
    commonWithDarkTheme
  }
}

export function getCompiledThemes(themes: ThemesConfig): CompiledThemes {
  const mergedThemes = getMergedThemeConfigs(themes);

  return {
    light: {
      lessVars: mergedThemes.commonWithLightTheme.lessVars,
      muiTheme: createMuiTheme(mergedThemes.commonWithLightTheme.materialThemeConfig)
    },
    dark: {
      lessVars: mergedThemes.commonWithDarkTheme.lessVars,
      muiTheme: createMuiTheme(mergedThemes.commonWithDarkTheme.materialThemeConfig)
    }
  }
}
