import {Theme, ThemeOptions} from "@material-ui/core/styles";
import {Merge} from "@sui/core";

export type ThemeOptionsGetter = ThemeOptions | ((theme: Theme) => ThemeOptions);

export interface SuiThemeConfig {
  lessVars?: { [key: string]: string }
  materialThemeConfig?: ThemeOptionsGetter
  baseTableMaterialThemeConfig?: ThemeOptionsGetter
  drawerMaterialThemeConfig?: ThemeOptionsGetter
}

export interface ThemesConfig {
  common?: SuiThemeConfig
  light?: SuiThemeConfig
  dark?: SuiThemeConfig
}

export interface ThemeAndOptions {
  theme: Theme,
  options: ThemeOptions
}

export type AntdThemeVars = { [key: string]: string }

export interface AntdTheme {
  lessVars: AntdThemeVars
}

export interface PreCompiledTheme {
  muiTheme: ThemeAndOptions
  baseTableMuiTheme: ThemeAndOptions
  drawerMaterialTheme: ThemeAndOptions
}

export type CompiledTheme = AntdTheme & {
  [key in keyof PreCompiledTheme]: Theme
} & {
  name: ThemeVariant;
}

export interface CompiledThemes {
  light: CompiledTheme
  dark: CompiledTheme
}

export type ThemeVariant = keyof CompiledThemes;
