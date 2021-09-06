// Включение кеша ломает кеширование antd-pro-merge-less
require = require("esm")(module, {cache: false});
const fs = require('fs');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

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
// Либа сначала пытается найти пакеты '@ant-design/pro-layout', '@ant-design/pro-table' и только после этого лезет в extraLibraries. Так как у нас их нету - ничего не рабоает
{
  const pathToFile = require.resolve("antd-pro-merge-less/index.js");
  const original = fs.readFileSync(pathToFile, 'utf8');
  const patched = original.replace(
    /const components = \['@ant.+/,
    'const components = extraLibraries;'
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

const {getMergedThemeConfigs} = require('../../react/es/themes/utils');

const buildTime = new Date().toISOString();

function defaultChainWebpack(config) {
  config
    .plugin('hard-source')
    .use(HardSourceWebpackPlugin, [{
      cacheDirectory: `node_modules/.cache/hard-source/${process.env.npm_lifecycle_event}/[confighash]`,
      cachePrune: {
        // Caches younger than `maxAge` are not considered for deletion. They must
        // be at least this (default: 2 days) old in milliseconds.
        // 2 Hrs
        maxAge: 2 * 60 * 60 * 1000,
        // All caches together must be larger than `sizeThreshold` before any
        // caches will be deleted. Together they must be at least this
        // (default: 50 MB) big in bytes.
        // 1.5Gb
        sizeThreshold: 1500 * 1024 * 1024
      }
    }])

  config
    .plugin('hard-source-exclude')
    .use(HardSourceWebpackPlugin.ExcludeModulePlugin, [[{
      test: /less-loader/
    }]]);

  // Used in copy-webpack-plugin
  fs.writeFileSync('./build_time.txt', buildTime);

  return config;
}

exports.defaultChainWebpack = defaultChainWebpack;

function generateUmiConfig(params) {
  const {
    title,
    themes,
    define,
    patchUmiConfig
  } = params;

  let {
    routes
  } = params;

  const {
    commonWithLightTheme,
    commonWithDarkTheme
  } = getMergedThemeConfigs(themes);


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

  routes = [
    {
      path: "/",
      component: require.resolve("@sui/react/es/GlobalRoutesWrapper"),
      routes
    }
  ];

  const plugins = [
    ['umi-plugin-react', umiPluginReactConfig]
  ];

  if (!process.env.NO_DARK) {
    plugins.push(['@sui/all/dark-theme-plugin.js', commonWithDarkTheme.lessVars]);
  }

  let umiConfig = {
    publicPath: "./",
    theme: commonWithLightTheme.lessVars,
    define: {
      "process.env.BUILD_TIME": buildTime,
      "process.env.NO_DARK": process.env.NO_DARK,
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
