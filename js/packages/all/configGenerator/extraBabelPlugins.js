const extraBabelPlugins = [
  [
    'babel-plugin-import',
    {
      'libraryName': '@material-ui/core',
      'libraryDirectory': 'esm',
      'camel2DashComponentName': false
    },
    'import-material'
  ],
  [
    'babel-plugin-import',
    {
      'libraryName': '@material-ui/icons',
      'libraryDirectory': 'esm',
      'camel2DashComponentName': false
    },
    'import-material-icons'
  ],
  [
    "babel-plugin-import",
    {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": true
    },
    'import-antd'
  ],
  [
    "babel-plugin-import",
    {
      "libraryName": "@ant-design/icons",
      "libraryDirectory": "es/icons",
      "camel2DashComponentName": false
    },
    "import-antd-icons"
  ]
];

exports.extraBabelPlugins = extraBabelPlugins;
