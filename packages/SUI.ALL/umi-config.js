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
      exclude: ['@smsoft/sui-all'],
    },
  },

  umiConfig: {
    publicPath: "/",
    theme: {
      'layout-header-height': '48px',
      'card-padding-wider': '24px',
    },
    treeShaking: true,
    history: 'hash',
    manifest: {
      basePath: '/',
    },
  }
};
