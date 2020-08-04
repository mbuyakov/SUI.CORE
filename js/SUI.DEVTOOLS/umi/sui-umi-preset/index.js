Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = () => {
  return {
    plugins: [
      // require.resolve('@umijs/plugin-access'),
      // require.resolve('@umijs/plugin-analytics'),
      // REPLACED BY plugin-antd-custom require.resolve('@umijs/plugin-antd'),
      // require.resolve('@umijs/plugin-antd'),
      // require.resolve('@umijs/plugin-crossorigin'),
      require.resolve('@umijs/plugin-dva'),
      require.resolve('@umijs/plugin-initial-state'),
      // require.resolve('@umijs/plugin-locale'),
      // require.resolve('@umijs/plugin-layout'),
      // require.resolve('@umijs/plugin-model'),
      // require.resolve('@umijs/plugin-request'),
      // require.resolve('@umijs/plugin-test'),
      require.resolve('@umijs/plugin-helmet'),
      ...(process.env.WEBPACK_FIVE ? [require.resolve("@umijs/plugin-webpack-5")] : []),
      require.resolve("@sui/sui-devtools/umi/plugin-antd-custom/lib"),
      require.resolve("@sui/sui-devtools/umi/sui-build-time"),
      require.resolve("@sui/sui-devtools/umi/sui-chunks"),
      require.resolve("@sui/sui-devtools/umi/sui-history-hash"),
      require.resolve("@sui/sui-devtools/umi/sui-kludges"),
      require.resolve("@sui/sui-devtools/umi/sui-theme"),
    ]
  };
}
