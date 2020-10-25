import {Theme, ThemeOptions} from "@material-ui/core/styles";
import {Merge} from "@sui/core";

export interface SuiThemeConfig {
  lessVars?: { [key: string]: string },
  materialThemeConfig?: ThemeOptions | ((muiDefaultTheme: Theme) => ThemeOptions)
}

export type CompiledSuiThemeConfig  = Merge<SuiThemeConfig, {
  materialThemeConfig?: ThemeOptions
}>;

export interface ThemesConfig {
  common?: SuiThemeConfig,
  light?: SuiThemeConfig,
  dark?: SuiThemeConfig
}

export type CompiledThemesConfig = {
  [Name in keyof ThemesConfig]?: CompiledSuiThemeConfig
}

export interface MergedThemeConfigs {
  commonWithLightTheme: CompiledSuiThemeConfig,
  commonWithDarkTheme: CompiledSuiThemeConfig
}

export interface CompiledTheme {
  name: ThemeVariant
  lessVars: { [key: string]: string },
  muiTheme: Theme
}

export interface CompiledThemes {
  light: CompiledTheme,
  dark: CompiledTheme
}

export type ThemeVariant = keyof CompiledThemes;
