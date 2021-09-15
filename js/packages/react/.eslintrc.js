const origin = require("@sui/linter/.eslintrc.js");

module.exports = {
  ...origin,
  rules: {
    ...origin.rules,
    "no-use-before-define": [0],
    "camelcase": [0],
    "no-console": [0],
    "react/jsx-indent-props": [1],
    "@typescript-eslint/no-empty-interface": [1],
    "react/static-property-placement": [1]
  }
}
