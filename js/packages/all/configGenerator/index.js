// Включение кеша ломает кеширование antd-pro-merge-less
require = require("esm")(module, {cache: false});
const fs = require('fs');
const path = require("path");
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const findCacheDir = require('find-cache-dir');

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


let mixedCacheGroups = [
  {
    name: 'sui',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]@sui/.test(resource);
    },
    priority: 20,
  },
  {
    name: 'material',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]@material-ui/.test(resource);
    },
    priority: 20,
  },
  {
    name: 'material-icons',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]@material-ui[\\/]icons/.test(resource);
    },
    priority: 30,
  },
  {
    name: 'antd',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]antd/.test(resource) || /[\\/]node_modules[\\/]rc-/.test(resource);
    },
    priority: 20,
  },
  {
    name: 'antd-icons',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]@ant-design[\\/]icons/.test(resource);
    },
    priority: 30,
  },
  {
    name: 'lodash',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]lodash/.test(resource);
    },
    priority: 20,
  },
  {
    name: 'moment',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]moment/.test(resource);
    },
    priority: 20,
  },
  {
    name: 'dx',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]@devexpress/.test(resource);
    },
    priority: 20,
  },
];

let asyncOnlyCacheGroups = [
  {
    name: 'vendors',
    test({resource}) {
      return /[\\/]node_modules[\\/]/.test(resource);
    },
    priority: 10,
  },
  {
    name: 'amcharts',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]@amcharts/.test(resource);
    },
    priority: 20,
  },
  {
    name: 'pdfmake',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]pdfmake/.test(resource);
    },
    priority: 20,
  },
  {
    name: 'xlsx',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]xlsx/.test(resource);
    },
    priority: 20,
  },
  {
    name: 'sentry',
    enforce: true,
    test({resource}) {
      return /[\\/]node_modules[\\/]@sentry/.test(resource);
    },
    priority: 20,
  },
]

const cacheGroups = {};

mixedCacheGroups.forEach(it => {
  let key = it.name;
  cacheGroups[key] = {...it};
  cacheGroups[key].name += '-initial';
  cacheGroups[key].chunks = 'initial';
  key += '-async';
  cacheGroups[key] = {...it};
  cacheGroups[key].name += '-async';
  cacheGroups[key].chunks = 'async';
  cacheGroups[key].priority += 5;
});

asyncOnlyCacheGroups.forEach(it => {
  let key = it.name;
  // cacheGroups[key] = {...it};
  // cacheGroups[key].name += '-initial';
  // cacheGroups[key].chunks = 'initial';
  key += '-async';
  cacheGroups[key] = {...it};
  cacheGroups[key].name += '-async';
  cacheGroups[key].chunks = 'async';
  cacheGroups[key].priority += 5;
});

const {getMergedThemeConfigs} = require('../../react/es/themes/utils');

const buildTime = new Date().toISOString();

const cacheDirectory = path.resolve(
  findCacheDir({
    name: 'hard-source',
    cwd: process.cwd(),
  }),
  `${process.env.npm_lifecycle_event}/[confighash]`,
);

function defaultChainWebpack(config) {
  if (!process.env.DISABLE_HARD_SOURCE) {
    config
      .plugin('hard-source')
      .use(HardSourceWebpackPlugin, [{
        cacheDirectory,
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
  }

  if (process.env.NODE_ENV === "production") {
    config.merge({
      optimization: {
        minimize: true,
        splitChunks: {
          chunks: 'all',
          automaticNameDelimiter: '.',
          cacheGroups,
        },
      }
    });
  }

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
    proxy,
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

  if (process.env.NODE_ENV === "production") {
    umiPluginReactConfig.chunks = [
      ...(Object.keys(cacheGroups)
        .map(it => cacheGroups[it].name)
        .filter(it => it.includes('initial'))
      ),
      'umi'
    ];
  }

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
    routes,
    proxy
  }

  if (patchUmiConfig) {
    umiConfig = patchUmiConfig(umiConfig);
  }

  return umiConfig;
}

exports.generateUmiConfig = generateUmiConfig;
