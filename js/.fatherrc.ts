import {IBundleOptions} from 'father-build/src/types';

const options: IBundleOptions = {
  cjs: {type: 'babel'},
  pkgs: [
    "core",
    "react",
    "all"
  ]
};

export default options;
