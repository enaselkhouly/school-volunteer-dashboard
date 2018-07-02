'use strict';

//const  fs  = require('fs');

function init(server) {

  // // Include all routes in the routes folder
  // fs.readdirSync(__dirname).forEach(function (file) {
  //   // get file names with extension '.js' except 'index.js'
  //   if( (file.substr(-3) == '.js') && (file !== 'index.js') ) {
  //     const routePath = './' + file;
  //
  //     // link the server with the route
  //     const route = require(routePath);
  //
  //     // Special case for child routes
  //     server.use('', route);
  //   }
  // }); // for each
  //
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
