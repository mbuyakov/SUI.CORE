import {Theme as MuiTheme, createTheme as muiCreateTheme} from "@sui/deps-material";
import {theme as antdTheme, ThemeConfig as AntdTheme} from "@sui/deps-antd";

export type SuiThemeComponents = "drawer" | "baseTable";
export type SuiThemeVariants = "light" | "dark";

export {MuiTheme, AntdTheme};

export interface SuiComponentTheme<MUI, ANTD> {
  mui: MUI
  antd: ANTD
}

export type SuiComponentThemeConfig = Partial<SuiComponentTheme<
  (base: MuiTheme, createTheme: typeof muiCreateTheme) => MuiTheme,
  (base: AntdTheme, theme: typeof antdTheme) => AntdTheme
>>;
export type SuiComponentThemeCompiled = SuiComponentTheme<MuiTheme, AntdTheme>;


export type SuiComponentsTheme<T> = {
  [component in SuiThemeComponents]?: T;
};

export type SuiComponentsThemeConfig = Partial<SuiComponentsTheme<SuiComponentThemeConfig>> & {base?: SuiComponentThemeConfig};
export type SuiComponentsThemeCompiled = SuiComponentsTheme<SuiComponentThemeCompiled> & {base: SuiComponentThemeCompiled};

export type SuiTheme<T> = {
  [variant in SuiThemeVariants]: T;
};

export type SuiThemeConfig = Partial<SuiTheme<SuiComponentsThemeConfig>> & { common?: SuiComponentsThemeConfig };
export type SuiThemeCompiled = SuiTheme<SuiComponentsThemeCompiled>;

export type ISuiThemeContext = SuiComponentThemeCompiled & {name: SuiThemeVariants};
