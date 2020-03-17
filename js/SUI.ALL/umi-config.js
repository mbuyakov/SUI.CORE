module.exports =  {
  // ref: https://umijs.org/plugin/umi-plugin-react.html
  umiPluginReact: {
    antd: true,
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
    // dynamicImport: {
    //   loadingComponent: './components/PageLoading/index',
    //   webpackChunkName: true,
    // },
    dll: {
      //TODO: Umi bug, check update
      exclude: ['@smsoft/sui-all', "@material-ui/icons"],
    },
  },

  umiConfig: {
    publicPath: "/",
    theme: {
      'layout-header-height': '48px',
      'card-padding-wider': '24px',
      "primary-color": "#56CBF8",
      "info-color": "#56CBF8",
      "error-color": "#FF6565",
      "highlight-color": "#FF6565",
      "success-color": "#FCF69B",
      "warning-color": "#A2E8AB",
      "border-radius-base": "8px",
      "btn-border-radius-sm": "6px",
      "btn-border-width": "2px",
      "font-size-base": "15px",
      "btn-font-size-sm": "14px", // as text
      "border-color-base":"rgba(217, 217, 217, 0.6)",
      "btn-shadow": "none"
    },
    treeShaking: true,
    history: 'hash',
    manifest: {
      basePath: '/',
    },
  }
};
