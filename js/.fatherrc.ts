import {IBundleOptions} from 'father-build/src/types';
const options: IBundleOptions = {
  esm: {
    type: 'babel',
    importLibToEs: true
  }
};

export default options;
