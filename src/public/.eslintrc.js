module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "jquery": true,
        "node": false
    },
    "parserOptions": {
        "sourceType": "script"
    },
    "rules": {
        "no-var": "off",
        "prefer-const": "off",
        "no-undef": "off",
        "no-unused-vars": [
          "error",
          {
            "args": "none"
          }
        ]
    }
};
