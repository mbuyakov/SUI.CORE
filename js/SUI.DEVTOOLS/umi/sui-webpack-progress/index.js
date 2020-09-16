const buildTime = new Date().toISOString();

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = api => {
  api.chainWebpack((config,{ webpack, env, createCSSRule })=>{
    config.plugin('ProgressPlugin').use(webpack.ProgressPlugin, [{

    }]);
    return config;
  });
};
