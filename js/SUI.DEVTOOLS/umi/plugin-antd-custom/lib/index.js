"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _path() {
  const data = require("path");

  _path = function _path() {
    return data;
  };

  return data;
}

function _fs() {
  const data = require("fs");

  _fs = function _fs() {
    return data;
  };

  return data;
}

function _umi() {
  const data = require("umi");

  _umi = function _umi() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const Mustache = _umi().utils.Mustache;

var _default = api => {
  api.describe({
    config: {
      schema(joi) {
        return joi.object({
          dark: joi.boolean(),
          compact: joi.boolean(),
          config: joi.object()
        });
      }

    }
  });
  api.modifyBabelPresetOpts(opts => {
    return _objectSpread({}, opts, {
      import: (opts.import || []).concat([{
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true
      }, /*{
        libraryName: 'antd-mobile',
        libraryDirectory: 'es',
        style: true
      }*/])
    });
  });
  const opts = api.userConfig.antd || {};

  if ((opts === null || opts === void 0 ? void 0 : opts.dark) || (opts === null || opts === void 0 ? void 0 : opts.compact)) {
    // support dark mode, user use antd 4 by default
    const _require = require('antd/dist/theme'),
          getThemeVariables = _require.getThemeVariables;

    api.modifyDefaultConfig(config => {
      config.theme = _objectSpread({}, getThemeVariables(opts), {}, config.theme);
      return config;
    });
  }

  api.addProjectFirstLibraries(() => [{
    name: 'antd',
    path: (0, _path().dirname)(require.resolve('antd/package.json'))
  }, /*{
    name: 'antd-mobile',
    path: (0, _path().dirname)(require.resolve('antd-mobile/package.json'))
  }*/]);

  if (opts === null || opts === void 0 ? void 0 : opts.config) {
    api.onGenerateFiles({
      fn() {
        // runtime.tsx
        const runtimeTpl = (0, _fs().readFileSync)((0, _path().join)(__dirname, 'runtime.tpl'), 'utf-8');
        api.writeTmpFile({
          path: 'plugin-antd/runtime.tsx',
          content: Mustache.render(runtimeTpl, {
            config: JSON.stringify(opts === null || opts === void 0 ? void 0 : opts.config)
          })
        });
      }

    }); // Runtime Plugin

    api.addRuntimePlugin(() => [(0, _path().join)(api.paths.absTmpPath, 'plugin-antd/runtime.tsx')]);
    api.addRuntimePluginKey(() => ['antd']);
  }
};

exports.default = _default;
