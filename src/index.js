'use strict';

const server    = require('../configs/initializers/server')(),
      database  = require('../configs/initializers/database'),
      config    = require('../configs');


database.connect(config);
server.create(config);
server.start();

module.exports = server;
