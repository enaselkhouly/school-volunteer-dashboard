'use strict';

function init(server) {

  // link the server with the routes
  const projectRoutes = require('./project');
  const taskRoutes = require('./task');
  const userRoutes = require('./user');

  /**
   * GET *
   * Define a catch route for random-url.
   */
  server.get('/', (req, res) => {
    res.redirect('/login');
  }); // GET *

  server.use('', projectRoutes);
  server.use('', taskRoutes);
  server.use('', userRoutes);

  server.use(function (req, res) {
    res.render('pageNotFound');
  });

  // /**
  //  * GET *
  //  * Define a catch route for random-url.
  //  */
  // server.get('*', (req, res) => {
  //   res.send('pageNotFound');
  // }); // GET *

} // init

module.exports = {
    init: init
}; //module.exports
