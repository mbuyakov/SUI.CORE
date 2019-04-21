import tslint from "rollup-plugin-tslint"
import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import postcss from 'rollup-plugin-postcss'
import url from 'rollup-plugin-url'
import svgr from '@svgr/rollup'
import * as ttypescript from 'ttypescript'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    json(),
    postcss({
      modules: true
    }),
    url(),
    svgr(),
    tslint({
      throwOnError: true
    }),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true,
      typescript: ttypescript
    }),
    commonjs()
  ],
  external(id) {
    return id.indexOf('node_modules') >= 0;
  }
}
