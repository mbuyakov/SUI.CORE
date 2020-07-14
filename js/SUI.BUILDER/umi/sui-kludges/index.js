Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = api => {
  api.modifyDefaultConfig(config => {
    config.nodeModulesTransform = {
      type: 'none'
    };
    return config;
  });
};

