'use strict';

const   passport            = require("passport"),
        localStrategy       = require("passport-local"),
        User                = require('../../src/models/User');

module.exports.init = function (config, server) {

  server.use(passport.initialize());
  server.use(passport.session());
  passport.use(new localStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser())

}
