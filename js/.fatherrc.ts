import {IBundleOptions} from 'father-build/src/types';
const {extraBabelPlugins} = require('@sui/all/configGenerator/extraBabelPlugins');
const options: IBundleOptions = {
  esm: {
    type: 'babel',
    importLibToEs: true
  },
  extraBabelPlugins
};

export default options;
