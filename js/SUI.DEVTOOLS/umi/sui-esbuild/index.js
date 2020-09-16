Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = api => {
  api.modifyBundleConfig(memo => {
    if (memo.optimization) {
      memo.optimization.minimizer = [
        new (require('esbuild-webpack-plugin').default)(),
      ];
    }
    return memo;
  });
};

