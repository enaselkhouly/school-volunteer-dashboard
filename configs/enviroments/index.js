'use strict';

const
    _ = require('lodash'),
    env = process.env.NODE_ENV || 'local';

let defaultConfig = {
    env: env
};

module.exports = defaultConfig;
