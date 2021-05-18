const origin = require("@sui/linter/.eslintrc.js");

module.exports = {
  ...origin,
  rules: {
    ...origin.rules,
    "no-use-before-define": [0],
    "camelcase": [0],
    "no-console": [0]
  }
}
