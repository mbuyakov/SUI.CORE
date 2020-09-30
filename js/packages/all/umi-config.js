const fs = require('fs');
const buildTime = new Date().toISOString();

function webpackPluginConfig(config) {
  // Used in copy-webpack-plugin
  fs.writeFileSync('./build_time.txt', buildTime);
}

module.exports =  {
  // ref: https://v2.umijs.org/config/
  umiConfig: {
    publicPath: "/",
    theme: {
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
      "border-color-base":"rgba(217, 217, 217, 0.6)",
      "btn-shadow": "none"
    },
    define: {
      "process.env.BUILD_TIME": buildTime,
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
    chainWebpack: webpackPluginConfig
  },

  // ref: https://umijs.org/plugin/umi-plugin-react.html
  umiPluginReact: {
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
  },
  webpackPluginConfig
};
