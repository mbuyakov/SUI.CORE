const CreateFileWebpack = require('create-file-webpack');

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
    config.plugin('CreateFileWebpack').use(CreateFileWebpack, [{
      path: './dist',
      fileName: 'build_time.txt',
      content: buildTime
    }]);
    return config;
  });
};
