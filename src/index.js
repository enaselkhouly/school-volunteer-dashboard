'use strict';

const flatpickr = require("flatpickr");

const server    = require('../configs/initializers/server')(),
      database  = require('../configs/initializers/database'),
      config    = require('../configs/enviroments');


database.connect(config);
server.create(config);
server.start();
