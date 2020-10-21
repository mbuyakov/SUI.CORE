/* eslint-disable @typescript-eslint/no-var-requires */
import {Theme, ThemeOptions} from '@material-ui/core/styles';

const fs = require('fs');
const {createMuiTheme}  = require('@material-ui/core/styles');
const merge = require("lodash/merge");


export interface SuiTheme {
  lessVars?: { [key: string]: string },
  materialThemeConfig?: ThemeOptions
}

export interface ThemesConfig {
  common?: SuiTheme,
  light?: SuiTheme,
  dark?: SuiTheme
}

const defaultSuiThemes: ThemesConfig = {
  common: {
    lessVars: {
      'layout-header-height': '48px',
      'card-padding-wider': '24px',
      "primary-color": "#56CBF8",
      "info-color": "#56CBF8",
      "error-color": "#FF6565",
      "highlight-color": "#FF6565",
      "success-color": "#A2E8AB",
      "warning-color": "#FCF69B",
      "border-radius-base": "8px",
      "btn-border-radius-sm": "6px",
      "btn-border-width": "2px",
      "font-size-base": "15px",
      "btn-font-size-sm": "14px", // as text
      "border-color-base": "rgba(217, 217, 217, 0.6)",
      "btn-shadow": "none"
    }
  },
  light: {
    materialThemeConfig: {
      palette: {
        type: "light"
      }
    }
  },
  dark: {
    materialThemeConfig: {
      palette: {
        type: "dark"
      }
    }
  }
};


const buildTime = new Date().toISOString();

function defaultChainWebpack(config) {
  // Used in copy-webpack-plugin
  fs.writeFileSync('./build_time.txt', buildTime);
}

function getFinalThemes(themes: ThemesConfig): {
  commonWithLightTheme: SuiTheme,
  commonWithDarkTheme: SuiTheme
} {
  const commonTheme: SuiTheme = merge({}, defaultSuiThemes.common, themes.common);
  const lightTheme: SuiTheme = merge({}, defaultSuiThemes.light, themes.light);
  const darkTheme: SuiTheme = merge({}, defaultSuiThemes.dark, themes.dark);
  let commonWithLightTheme: SuiTheme = merge({}, commonTheme, lightTheme);
  let commonWithDarkTheme: SuiTheme = merge({}, commonTheme, darkTheme);
  return {
    commonWithLightTheme,
    commonWithDarkTheme
  }
}

export interface MuiThemes {
  lightMaterialTheme: Theme,
  darkMaterialTheme: Theme
}

function generateMuiThemes(themes: ThemesConfig): MuiThemes {
  const finalThemes = getFinalThemes(themes);

  const lightMaterialTheme = createMuiTheme(finalThemes.commonWithLightTheme.materialThemeConfig);
  const darkMaterialTheme = createMuiTheme(finalThemes.commonWithDarkTheme.materialThemeConfig);

  return {
    lightMaterialTheme,
    darkMaterialTheme
  }
}

export interface UmiConfigParams {
  title: string,
  routes: any[],
  themes: ThemesConfig,
  define?: { [key: string]: string },
  patchUmiConfig?: (config: any) => any
}

function generateUmiConfig(params: UmiConfigParams): any {
  const {
    title,
    routes,
    themes,
    define,
    patchUmiConfig
  } = params;

  const {
    commonWithLightTheme,
    commonWithDarkTheme
  } = getFinalThemes(themes);


  const umiPluginReactConfig = {
    title,
    dva: true,
    locale: {
      enable: true,
      default: 'ru-RU',
      baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
      antd: true,
    },
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      workboxOptions: {
        importWorkboxFrom: 'local',
      },
    },
  };

  const plugins = [
    ['umi-plugin-react', umiPluginReactConfig],
    ['@sui/all/dark-theme-plugin.js', commonWithDarkTheme.lessVars]
  ];

  let umiConfig = {
    publicPath: "/",
    theme: commonWithLightTheme.lessVars,
    define: {
      "process.env.BUILD_TIME": buildTime,
      ...define
    },
    treeShaking: true,
    minimizer: 'terserjs',
    extraBabelPlugins: [
      [
        'babel-plugin-import',
        {
          'libraryName': '@material-ui/core',
          'libraryDirectory': 'esm',
          'camel2DashComponentName': false
        },
        'import-material'
      ],
      [
        'babel-plugin-import',
        {
          'libraryName': '@material-ui/icons',
          'libraryDirectory': 'esm',
          'camel2DashComponentName': false
        },
        'import-material-icons'
      ],
      [
        "babel-plugin-import",
        {
          "libraryName": "antd",
          "libraryDirectory": "es",
          "style": true
        },
        'import-antd'
      ],
      [
        "babel-plugin-import",
        {
          "libraryName": "@ant-design/icons",
          "libraryDirectory": "es/icons",
          "camel2DashComponentName": false
        },
        "import-antd-icons"
      ]
    ],
    history: 'hash',
    manifest: {
      basePath: '/',
    },
    copy: [
      {
        "from": "build_time.txt",
        // to - default = compiler.options.output
        // "to": "dist/build_time.txt"
      }
    ],
    chainWebpack: defaultChainWebpack,
    plugins,
    routes
  }

  if (patchUmiConfig) {
    umiConfig = patchUmiConfig(umiConfig);
  }

  return umiConfig;
}

exports.generateUmiConfig = generateUmiConfig;
exports.generateMuiThemes = generateMuiThemes;
exports.defaultChainWebpack = defaultChainWebpack;
