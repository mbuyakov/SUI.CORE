import merge from 'lodash/merge';
import {createMuiTheme} from '@material-ui/core/styles';

import {CompiledSuiThemeConfig, CompiledThemes, MergedThemeConfigs, SuiThemeConfig, ThemesConfig} from "@/themes/types";
import {defaultMuiTheme, defaultThemesConfig} from "@/themes/defaultThemesConfig";
import {getThemeVariables} from '@/antdMissedExport';

const lightAntdTheme = getThemeVariables({dark: false});
const darkAntdTheme = getThemeVariables({dark: true});

function compileThemeConfig(theme?: SuiThemeConfig): CompiledSuiThemeConfig {
  if (!theme) {
    return {};
  }

  if (typeof theme.materialThemeConfig === 'function') {
    theme.materialThemeConfig = theme.materialThemeConfig(defaultMuiTheme);
  }

  if (typeof theme.baseTableMaterialThemeConfig === 'function') {
    theme.baseTableMaterialThemeConfig = theme.baseTableMaterialThemeConfig(defaultMuiTheme);
  }

  return theme as CompiledSuiThemeConfig;
}

function compileAndMerge(...themes: SuiThemeConfig[]): CompiledSuiThemeConfig {
  const compiledThemes = themes.map(compileThemeConfig);
  return merge({}, ...compiledThemes);
}

export function getMergedThemeConfigs(themes: ThemesConfig): MergedThemeConfigs {
  const commonTheme = compileAndMerge(defaultThemesConfig.common, themes.common);
  const lightTheme = compileAndMerge(defaultThemesConfig.light, themes.light);
  const darkTheme = compileAndMerge(defaultThemesConfig.dark, themes.dark);

  const commonWithLightTheme = merge({
    lessVars: lightAntdTheme
  }, commonTheme, lightTheme);
  const commonWithDarkTheme = merge({
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
      name: "light",
      lessVars: mergedThemes.commonWithLightTheme.lessVars,
      muiTheme: createMuiTheme(mergedThemes.commonWithLightTheme.materialThemeConfig),
      baseTableMuiTheme: createMuiTheme(merge({}, mergedThemes.commonWithLightTheme.materialThemeConfig, mergedThemes.commonWithLightTheme.baseTableMaterialThemeConfig))
    },
    dark: {
      name: "dark",
      lessVars: mergedThemes.commonWithDarkTheme.lessVars,
      muiTheme: createMuiTheme(mergedThemes.commonWithDarkTheme.materialThemeConfig),
      baseTableMuiTheme: createMuiTheme(merge({}, mergedThemes.commonWithDarkTheme.materialThemeConfig, mergedThemes.commonWithDarkTheme.baseTableMaterialThemeConfig))
    }
  }
}
