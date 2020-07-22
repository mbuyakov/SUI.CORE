Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = api => {
  api.modifyDefaultConfig(config => {
    config.chunks = ['vendors', 'sui', 'umi'];
    return config;
  });

  api.chainWebpack((config, {webpack, env, createCSSRule}) => {
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

    return config;
  });
};
