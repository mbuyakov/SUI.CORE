const origin = require("@sui/linter/.eslintrc.js");

module.exports = {
  ...origin,
  rules: {
    ...origin.rules,
    "react/jsx-indent-props": [1],
    "jsx-a11y/click-events-have-key-events": [1],
    "jsx-a11y/no-static-element-interactions": [1],
    "jsx-a11y/anchor-is-valid": [1],
    "@typescript-eslint/no-empty-interface": [1],
    "react/static-property-placement": [1],
    "jsx-a11y/no-autofocus": [1],
    "jsx-a11y/no-noninteractive-element-interactions": [1],
  }
}
