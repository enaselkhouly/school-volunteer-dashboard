'use strict';

const   passport            = require("passport"),
        localStrategy       = require("passport-local"),
        expressSession      = require("express-session"),
        User                = require('../../src/models/User');

module.exports.init = function (config, server) {

  // Configure PASSPORT
  server.use(expressSession({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false
  }));

  server.use(passport.initialize());
  server.use(passport.session());
  passport.use(new localStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser())

}
