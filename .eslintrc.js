module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "jquery": true,
        "mocha": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": "6"
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
