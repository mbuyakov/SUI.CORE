Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = api => {
  api.modifyDefaultConfig(config => {
    config.history = {
      type: 'hash'
    };
    return config;
  });
};

