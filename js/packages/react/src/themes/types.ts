import {Theme, ThemeOptions} from "@material-ui/core/styles";

export interface SuiThemeConfig {
  lessVars?: { [key: string]: string },
  materialThemeConfig?: ThemeOptions
}

export interface ThemesConfig {
  common?: SuiThemeConfig,
  light?: SuiThemeConfig,
  dark?: SuiThemeConfig
}

export interface MergedThemeConfigs {
  commonWithLightTheme: SuiThemeConfig,
  commonWithDarkTheme: SuiThemeConfig
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
