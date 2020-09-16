Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = api => {
  api.chainWebpack((config,{ webpack, env, createCSSRule })=>{
    config.plugin('ProfilingPlugin').use(webpack.debug.ProfilingPlugin, [{

    }]);
    return config;
  });
};
