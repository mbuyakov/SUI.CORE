const fs = require('fs');
const buildTime = new Date().toISOString();
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function webpackPluginConfig(config) {
  // Used in copy-webpack-plugin
  fs.writeFileSync('./build_time.txt', buildTime);

  config.plugin('define').tap(definitions => {
    definitions[0] = {
      ...definitions[0],
      'process.env': {
        ...definitions[0]['process.env'],
        BUILD_TIME: `"${buildTime}"`
      }
    };
    return definitions;
  });

  // If analyze
  if (!process.env.NOT_ANALYZE) {
    config.plugin('BundleAnalyzerPlugin').use(BundleAnalyzerPlugin, [{
      openAnalyzer: false,
      analyzerMode: 'static'
    }]);
  }

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
    treeShaking: true,
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
