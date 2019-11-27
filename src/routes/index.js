'use strict';

function init(server) {

  // link the server with the routes
  const homeRoute = require('./home');
  const projectRoutes = require('./project');
  const taskRoutes = require('./task');
  const userRoutes = require('./user');

  server.use('', homeRoute);
  server.use('', projectRoutes);
  server.use('', taskRoutes);
  server.use('', userRoutes);

   /*
   * Define a catch route for random-url.
   */
  server.use( (req, res) => {
    res.redirect("/login");
  });

} // init

module.exports = {
    init: init
}; //module.exports
