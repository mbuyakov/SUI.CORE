import {IBundleOptions} from 'father-build/src/types';

const options: IBundleOptions = {
  esm: {
    type: 'babel',
    importLibToEs: true
  },
  pkgs: [
    "sentry",
    "core",
    "charts",
    "react",
    "all"
  ]
};

export default options;
