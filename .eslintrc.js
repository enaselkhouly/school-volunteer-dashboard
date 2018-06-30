module.exports = {
"parserOptions": {
    "sourceType": "module",
    "ecmaVersion": "6"
},
"extends": "eslint:recommended",
"env": {
    "node": true,
    "es6": true
  },
"rules": {
    "no-var": "error",
    "no-multiple-empty-lines": "warn",
    "prefer-const": "off",
    "no-console": "off",
    "no-empty": "error",
    "no-unused-vars": [
      "error"
    ]
}
};
