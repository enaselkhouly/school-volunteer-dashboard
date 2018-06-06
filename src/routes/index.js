'use strict';

const  fs  = require('fs');

function init(server) {

  // Include all routes in the routes folder
  fs.readdirSync(__dirname).forEach(function (file) {
    // get file names with extension '.js' except 'index.js'
    if( (file.substr(-3) == '.js') && (file !== 'index.js') ) {
      let routePath = './' + file;
      // get the http path from the filename without the extension
      let httpPath = '/' + file.slice(0,-3);

      // link the server with the route
      let route = require(routePath);

      // Special case for child routes
      server.use('', route);
    }
  }); // for each

// // link the server with the routes
// const taskRoutes = require('./task');
// const projectRoutes = require('./project');
// const userRoutes = require('./user');
//
// server.use("/users", userRoutes);
// server.use("/projects", projectRoutes);
// server.use("/projects/:id/tasks", taskRoutes);


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
