const buildTime = new Date().toISOString();

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = api => {
  api.modifyDefaultConfig(config => {
    config.define = {
      BUILD_TIME: buildTime,
      ...config.define,
    };
    return config;
  });

  api.chainWebpack((config,{ webpack, env, createCSSRule })=>{
    config.plugin('ProfilingPlugin').use(webpack.debug.ProfilingPlugin, [{

    }]);
    return config;
  });
};
