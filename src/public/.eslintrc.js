module.exports = {
  "parserOptions": {
      "sourceType": "script"
  },
  "env": {
      "browser": true,
      "commonjs": true,
      "jquery": true,
      "node": false
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
