function webpackPluginConfig(config) {
  // If build
  if (!process.env.NOT_BUILD) {
    config.merge({
      optimization: {
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 1,
          minChunks: 1,
          automaticNameDelimiter: '.',
          cacheGroups: {
            vendor: {
              name: 'vendors',
              test({resource}) {
                return /[\\/]node_modules[\\/]/.test(resource) && !/[\\/]node_modules[\\/]@sui/.test(resource);
              },
              priority: 10,
            },
            sui: {
              name: 'sui',
              test({resource}) {
                return /[\\/]node_modules[\\/]@sui/.test(resource);
              },
              priority: 10,
            },
          },
        },
      }
    });
  }
}

module.exports =  {
  // ref: https://v2.umijs.org/config/
  umiConfig: {
    publicPath: "/",
    treeShaking: true,
    history: 'hash',
    manifest: {
      basePath: '/',
    },
    chainWebpack: webpackPluginConfig
  },

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
      exclude: ['@sui/sui-all', "@material-ui/icons"],
    },
    // If build
    ...(!process.env.NOT_BUILD ? {
      chunks: ['vendors', 'sui', 'umi']
    } : {})
  },
  webpackPluginConfig
};
