'use strict';

//const  fs  = require('fs');

function init(server) {

  // link the server with the routes
  const projectRoutes = require('./project');
  const taskRoutes = require('./task');
  const userRoutes = require('./user');

  server.use('', projectRoutes);
  server.use('', taskRoutes);
  server.use('', userRoutes);


  /**
   * GET *
   * Define a catch route for random-url.
   */
  server.get('/', (req, res) => {
    res.redirect('/login');
  }); // GET *


  /**
   * GET *
   * Define a catch route for random-url.
   */
  server.get('*', (req, res) => {
    res.send("Page could not be found!");
  }); // GET *

} // init

module.exports = {
    init: init
}; //module.exports
