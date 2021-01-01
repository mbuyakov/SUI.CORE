const origin = require("@sui/linter/.eslintrc-sui.js");

module.exports = {
  ...origin,
  rules: {
    ...origin.rules,
    "react/jsx-indent-props": [1],
    "@typescript-eslint/no-empty-interface": [1],
    "react/static-property-placement": [1],
  }
}
