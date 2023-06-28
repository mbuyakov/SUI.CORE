import {SuiComponentsTheme, SuiComponentsThemeCompiled, SuiComponentThemeCompiled, SuiComponentThemeConfig, SuiThemeCompiled, SuiThemeComponents, SuiThemeConfig} from "./types";
import {createTheme as muiCreateTheme} from "@sui/deps-material";
import {theme as antdTheme} from "@sui/deps-antd";
import {antdDefaultTheme, muiDefaultTheme} from "./defaultTheme";
import {Nullable} from "@sui/util-types";

/*
* SUI theme merging magic
*
* (^) - see this note
* common - apply to all variant
* variant - light or dark
* default theme - from SUI
* project theme - from module args(project)
* "base" component theme - theme from "base" component (work non as usual component)
* component theme - theme from components block(exclude "base" component)
*
* (All parts of theme is optional)
*
* basic const themes from framework
* + common(^) default theme(^) "base" component theme(^)
*   + common(^) project theme(^) "base" component theme(^) => BASE_BASELINE
*     + common(^) default theme(^) component theme(^)
*       + common(^) project theme(^) component theme(^) => COMPONENT_BASELINE
*
* Then, for each variant for each component (from any configs - default theme(^), project theme(^); common(^) or variant(^))
* COMPONENT_BASELINE
*   + variant(^) default theme(^) "base" component theme(^)
*     + variant(^) project theme(^) "base" component theme(^)
*       + variant(^) component theme(^)
*/

// Kludges for types
const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;

const mapComponents = (obj: SuiComponentsTheme<SuiComponentThemeCompiled>, mapper: (component: SuiThemeComponents, value: SuiComponentThemeCompiled) => SuiComponentThemeCompiled): SuiComponentsThemeCompiled =>
  Object.fromEntries(
    Object
      .entries(obj)
      .map(([k, v]) => [k, mapper(k as SuiThemeComponents, v)])
  ) as SuiComponentsThemeCompiled;

export const mergeSuiComponentThemes = (base: SuiComponentThemeCompiled, ...overrides: Array<Nullable<SuiComponentThemeConfig>>): SuiComponentThemeCompiled => {
  return overrides.reduce<SuiComponentThemeCompiled>((base, override) => {
    if (!override) {
      return base;
    }

    const mui = override.mui?.(base.mui, muiCreateTheme) ?? base.mui;
    const antd = override.antd?.(base.antd, antdTheme) ?? base.antd;

    return {mui, antd};
  }, base);
};

export const getComponents = (theme: SuiThemeConfig): Set<SuiThemeComponents> => {
  const ret = new Set<SuiThemeComponents>();

  getKeys(theme).forEach(variant => {
    const themeVariant = theme[variant];
    // eslint-disable-next-line eqeqeq
    if (themeVariant != undefined) {
      getKeys(themeVariant).forEach(component => {
        if (component !== "base") {
          ret.add(component);
        }
      });
    }
  });

  return ret;
};

export const compileFinalTheme = (defaultTheme: SuiThemeConfig, projectTheme: SuiThemeConfig): SuiThemeCompiled => {
  const defaultThemeComponents = getComponents(defaultTheme);
  const projectThemeComponents = getComponents(projectTheme);
  const components = new Set<SuiThemeComponents>([...defaultThemeComponents, ...projectThemeComponents]);
  const defaultComponentTheme: SuiComponentThemeCompiled = {mui: muiDefaultTheme, antd: antdDefaultTheme};

  const baseBaseline = mergeSuiComponentThemes(
    defaultComponentTheme,
    defaultTheme.common?.base,
    projectTheme.common?.base
  );

  const componentsBaseline: SuiComponentsThemeCompiled = {
    base: baseBaseline
  };

  components.forEach(component => {
    componentsBaseline[component] = mergeSuiComponentThemes(
      baseBaseline,
      defaultTheme.common?.[component],
      projectTheme.common?.[component]
    );
  });

  const light: SuiComponentsThemeCompiled = mapComponents(
    componentsBaseline,
    (component, componentBaseline) => mergeSuiComponentThemes(
      componentBaseline,
      defaultTheme.light?.[component],
      projectTheme.light?.[component]
    ));

  const dark: SuiComponentsThemeCompiled = mapComponents(
    componentsBaseline,
    (component, componentBaseline) => mergeSuiComponentThemes(
      componentBaseline,
      defaultTheme.dark?.[component],
      projectTheme.dark?.[component]
    ));

  return {light, dark};
};
