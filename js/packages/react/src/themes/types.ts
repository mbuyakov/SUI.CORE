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

export type CompiledThemeWithoutAntd = CompiledThemeBase & {
  baseTableMuiTheme: Theme
  drawerMaterialTheme: Theme
}

export type CompiledTheme = CompiledThemeWithoutAntd & AntdTheme

export interface CompiledThemes {
  light: CompiledTheme
  dark: CompiledTheme
}

export type ThemeVariant = keyof CompiledThemes;
