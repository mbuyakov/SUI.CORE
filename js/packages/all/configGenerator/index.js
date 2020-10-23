// Включение кеша ломает кеширование antd-pro-merge-less
require = require("esm")(module, {cache: false});
const fs = require('fs');

// Почему бы не попатчить чужую либу на лету?
// После замены require на esm версию ноде становится плохо от наличия шеллбенга в файле
{
  const pathToFile = require.resolve("antd-pro-merge-less/genModuleLess.js");
  const original = fs.readFileSync(pathToFile, 'utf8');
  const patched = original.replace(
    /^#!\//,
    '// #!/'
  );
  fs.writeFileSync(pathToFile, patched, 'utf8');
}
// Какая-то странная строка, похожа на опечатку. Комментим нафиг, без этого кеш не работает
{
  const pathToFile = require.resolve("antd-pro-merge-less/index.js");
  const original = fs.readFileSync(pathToFile, 'utf8');
  const patched = original.replace(
    /(?<=\s) fs\.writeFileSync\(modifyVarsArrayPath, JSON\.stringify\(modifyVars\)\);/,
    '// fs.writeFileSync(modifyVarsArrayPath, JSON.stringify(modifyVars));'
  );
  fs.writeFileSync(pathToFile, patched, 'utf8');
}
// Во, теперь можно грузиться дальше

const { getFinalThemes } = require('../../react/es/themes/utils');

const buildTime = new Date().toISOString();

function defaultChainWebpack(config) {
  // Used in copy-webpack-plugin
  fs.writeFileSync('./build_time.txt', buildTime);
}
exports.defaultChainWebpack = defaultChainWebpack;

function generateUmiConfig(params) {
  const {
    title,
    routes,
    themes,
    define,
    patchUmiConfig
  } = params;

  const {
    commonWithLightTheme,
    commonWithDarkTheme
  } = getFinalThemes(themes);


  const umiPluginReactConfig = {
    title,
    dva: true,
    locale: {
      enable: true,
      default: 'ru-RU',
      baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
      antd: true,
    },
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      workboxOptions: {
        importWorkboxFrom: 'local',
      },
    },
  };

  const plugins = [
    ['umi-plugin-react', umiPluginReactConfig],
    ['@sui/all/dark-theme-plugin.js', commonWithDarkTheme.lessVars]
  ];

  let umiConfig = {
    publicPath: "/",
    theme: commonWithLightTheme.lessVars,
    define: {
      "process.env.BUILD_TIME": buildTime,
      ...define
    },
    treeShaking: true,
    minimizer: 'terserjs',
    extraBabelPlugins: [
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
    ],
    history: 'hash',
    manifest: {
      basePath: '/',
    },
    copy: [
      {
        "from": "build_time.txt",
        // to - default = compiler.options.output
        // "to": "dist/build_time.txt"
      }
    ],
    chainWebpack: defaultChainWebpack,
    plugins,
    routes
  }

  if (patchUmiConfig) {
    umiConfig = patchUmiConfig(umiConfig);
  }

  return umiConfig;
}
exports.generateUmiConfig = generateUmiConfig;
