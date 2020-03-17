// module.exports = ({ config }) => {
//     config.module.rules.push({
//         test: /\.(ts|tsx)$/,
//         use: [
//             {
//                 loader: require.resolve('awesome-typescript-loader'),
//             },
//             // Optional
//             {
//                 loader: require.resolve('react-docgen-typescript-loader'),
//             },
//         ],
//     });
//     config.resolve.extensions.push('.ts', '.tsx');
//     return config;
// };

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('awesome-typescript-loader'),
      },
      // Optional
      {
        loader: require.resolve('react-docgen-typescript-loader'),
      },
    ],
  });
  config.module.rules.push({
    test: /\.less$/,
    loaders: [
      'style-loader',
      'css-loader',
      {
        loader: 'less-loader',
        options: {
          javascriptEnabled: true,
          modifyVars: {
            'primary-color': '#56CBF8',
            'error-color': '#FF6565',
            'border-radius-base': '8px'
          },
        },
      },
    ],
    // include: path.resolve(__dirname, '../src/'),
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
