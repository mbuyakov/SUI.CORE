const origin = require("@sui/linter/.eslintrc-sui.js");

module.exports = {
  ...origin,
  rules: {
    ...origin.rules,
    "no-restricted-imports": [
      origin.rules["no-restricted-imports"][0],
      {
        ...origin.rules["no-restricted-imports"][1],
        "patterns": origin.rules["no-restricted-imports"][1].patterns.filter(it => it !== "@sui/all")
      }
    ],
    "import/no-unresolved": [0] // Managed by TS
  }
}
