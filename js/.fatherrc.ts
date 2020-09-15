import {IBundleOptions} from 'father-build/src/types';

const options: IBundleOptions = {
  cjs: {type: 'babel'},
  pkgs: [
    "core",
    "all"
  ]
};

export default options;
