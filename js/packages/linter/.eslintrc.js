module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "@typescript-eslint",
//    "prettier"
  ],
  "extends": [
    "plugin:react/recommended",
    "airbnb",
//    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
    ],
//    "prettier/prettier": "error",
//    "@typescript-eslint/no-unused-vars": "off",
    "react/jsx-filename-extension": [
      1,
      { "extensions": [".js", ".jsx", ".ts", ".tsx"] }
    ],
    "@typescript-eslint/no-unused-vars": 1,
    "@typescript-eslint/indent": 0,
    "@typescript-eslint/array-type": 0,
    "@typescript-eslint/no-object-literal-type-assertion": 0,
    "@typescript-eslint/prefer-interface": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
//    "@typescript-eslint/prefer-readonly": 2,
    "@typescript-eslint/explicit-function-return-type": 1,
    "quotes": [0],
    "@typescript-eslint/interface-name-prefix": [0],
    "no-use-before-define": [0],
    "comma-dangle": [0],
    "object-curly-spacing": [0],
    "default-case": [0],
    "import/no-extraneous-dependencies": [0],
    "no-nested-ternary": [0],
    "semi": [0],
    "max-len": [0],
    "indent": [0],
    "react/destructuring-assignment": [0],
    "react/jsx-curly-newline": [0],
    "max-classes-per-file": [0],
    "lines-between-class-members": [0],
    "arrow-parens": [0],
    "@typescript-eslint/member-delimiter-style": [0],
    "spaced-comment": [0],
    "class-methods-use-this": [0],
    "react/jsx-one-expression-per-line": [0],
    "@typescript-eslint/ban-ts-comment": [0],
    "@typescript-eslint/ban-types": [0],
    "react/jsx-curly-spacing": [0],
    "no-useless-escape": [0],
    "padded-blocks": [0],
    "no-else-return": [0],
    "no-lonely-if": [0],
    "import/prefer-default-export": [0],
    "key-spacing": [0],
    "camelcase": [0],
    "no-multi-spaces": [0],
    "react/sort-comp": [0],
    "eqeqeq": [0],
    "keyword-spacing": [0],
    "react/no-unused-state": [0],
    "block-spacing": [0],
    "object-curly-newline": [0],
    "no-await-in-loop": [0],
    "react/no-find-dom-node": [0],
    "no-confusing-arrow": [0],
    "no-underscore-dangle": [0],
    "no-multiple-empty-lines": [0],
    "prefer-const": [0],
    "no-fallthrough": [0],
    "space-unary-ops": [0],
    "react/jsx-tag-spacing": [0],
    "jsx-quotes": [0],
    "space-infix-ops": [0],
    "comma-spacing": [0],
    "comma-style": [0],
    "@typescript-eslint/no-inferrable-types": [0],
    "no-plusplus": [0],
    "no-mixed-operators": [0],
    "react/jsx-boolean-value": [0],
    "react/jsx-props-no-spreading": [0],
    "no-return-await": [0],
    "no-return-assign": [0],
    "no-restricted-syntax": [0],
    "no-shadow": [0],
    "react/jsx-wrap-multilines": [0],
    "react/jsx-closing-tag-location": [0],
    "no-param-reassign": [0],
    "no-prototype-builtins": [0],
    "react/prefer-stateless-function": [0],
    "prefer-destructuring": [0],
    "no-restricted-globals": [0],
    "prefer-promise-reject-errors": [0],
    "react/no-access-state-in-setstate": [0],
    "consistent-return": [0],
    "array-callback-return": [0],
    "implicit-arrow-linebreak": [0],
    "function-paren-newline": [0],
    "react/no-did-update-set-state": [0],
    "react/jsx-indent": [0],
    "react/jsx-curly-brace-presence": [0],
    "react/prop-types": [0],
    "react/no-deprecated": [0],
    "no-throw-literal": [0],
    "operator-linebreak": [0],
    "no-unused-expressions": [0],
    "no-cond-assign": [0],
    "react/jsx-no-target-blank": [0],
    "react/jsx-closing-bracket-location": [0],
    "space-in-parens": [0],
    "quote-props": [0],
    "no-unneeded-ternary": [0],
    "no-inner-declarations": [0],
    "@typescript-eslint/class-name-casing": [0],
    "space-before-function-paren": [0],
    "no-restricted-properties": [0],
    "no-useless-return": [0],
    "react/no-unescaped-entities": [0],
    "no-extra-boolean-cast": [0],
    "space-before-blocks": [0],
    "react/jsx-pascal-case": [0],
    "react/no-children-prop": [0],
    "react/jsx-fragments": [0],
    "no-useless-constructor": [0],
    "semi-spacing": [0],
    "@typescript-eslint/type-annotation-spacing": [0],
    "new-cap": [0],
    "jsx-a11y/control-has-associated-label": [0],
    "no-case-declarations": [0],
    "no-eval": [0],
    "no-control-regex": [0],
    "no-trailing-spaces": [0],
    "arrow-body-style": [0],
    "react/require-default-props": [0],
    "linebreak-style": 0,
    "no-restricted-imports": [ // for tree-snaking
      "error",
      {
        "patterns": [
          "@material-ui/*/*/*",
          "!@material-ui/core/test-utils/*",
          "@ant-design/icons/*",
          "xlsx", // Use async kostyl - @sui/charts
          "@amcharts/amcharts4", // Use async kostyl - @sui/charts
          "@sui/all", // Don't use @sui/all in SUI repo
          "@sui/*/*" // Import only from root of package
        ]
      }
    ]
  },
  "settings": {
    "import/resolver": {
      "typescript": {},
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  }
}
