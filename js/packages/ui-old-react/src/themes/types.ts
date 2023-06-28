import {Theme, DeprecatedThemeOptions} from "@mui/material/styles";

export type DeprecatedThemeOptionsGetter = DeprecatedThemeOptions | ((theme: Theme) => DeprecatedThemeOptions);

export interface SuiThemeConfig {
  lessVars?: { [key: string]: string }
  materialThemeConfig?: DeprecatedThemeOptionsGetter
  baseTableMaterialThemeConfig?: DeprecatedThemeOptionsGetter
  drawerMaterialThemeConfig?: DeprecatedThemeOptionsGetter
}

export interface ThemesConfig {
  common?: SuiThemeConfig
  light?: SuiThemeConfig
  dark?: SuiThemeConfig
}

export interface ThemeAndOptions {
  theme: Theme,
  options: DeprecatedThemeOptions
}

export type AntdThemeVars = { [key: string]: string };

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
};

export interface CompiledThemes {
  light: CompiledTheme
  dark: CompiledTheme
}

export type ThemeVariant = keyof CompiledThemes;
