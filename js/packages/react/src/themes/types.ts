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

export type AntdThemeVars = { [key: string]: string }

export interface AntdTheme {
  lessVars: AntdThemeVars
}

export interface CompiledThemeBase {
  name: ThemeVariant
  muiTheme: Theme
}

export type CompiledTheme = CompiledThemeBase & {
  baseTableMuiTheme: Theme
  drawerMaterialTheme: Theme
}

export interface CompiledThemes {
  light: CompiledTheme & AntdTheme
  dark: CompiledTheme & AntdTheme
}

export type ThemeVariant = keyof CompiledThemes;
