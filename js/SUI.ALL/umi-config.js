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
    manifest: {
      basePath: '/',
    },
    chainWebpack: webpackPluginConfig
  },

  // ref: https://umijs.org/plugin/umi-plugin-react.html
  umiPluginReact: {
    // If build
    ...(!process.env.NOT_BUILD ? {
      chunks: ['vendors', 'sui', 'umi']
    } : {})
  },
  webpackPluginConfig
};
