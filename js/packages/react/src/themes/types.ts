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

export interface CompiledThemeBase {
  name: ThemeVariant
  lessVars: { [key: string]: string }
  muiTheme: Theme
}

export type CompiledTheme = CompiledThemeBase & {
  baseTableMuiTheme: Theme
  drawerMaterialTheme: Theme
}

export interface CompiledThemes {
  light: CompiledTheme
  dark: CompiledTheme
}

export type ThemeVariant = keyof CompiledThemes;
