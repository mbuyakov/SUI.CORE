Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = () => {
  return {
    plugins: [
      ...(process.env.WEBPACK_FIVE ? [require.resolve("@umijs/plugin-webpack-5")] : []),
      require.resolve("@sui/sui-builder/umi/sui-build-time"),
      require.resolve("@sui/sui-builder/umi/sui-kludges"),
      require.resolve("@sui/sui-builder/umi/sui-theme"),
    ]
  };
}
