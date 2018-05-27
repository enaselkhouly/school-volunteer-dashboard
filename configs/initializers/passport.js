'use strict';

const   passport            = require("passport"),
        localStrategy       = require("passport-local"),
        expressSession      = require("express-session"),
        User                = require('../../src/models/User');

module.exports.init = function (config, server) {

  // Configure PASSPORT
  server.use(expressSession({
      secret: config.secret,
      resave: false,
      saveUninitialized: false
  }));

  server.use(passport.initialize());
  server.use(passport.session());
  passport.use(new localStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser())

}

// "use strict";
//
// let passport = require("passport");
// let LocalStrategy = require("passport-local").Strategy;
// let User = require("../../src/models/User");
// let expressSession      = require("express-session");
//
// module.exports.init = function(config, server) {
//     // Configure PASSPORT
//     server.use(expressSession({
//         secret: config.secret,
//         resave: false,
//         saveUninitialized: false
//     }));
//
//
//     // Use passport session
//     server.use(passport.initialize());
//     server.use(passport.session());
//
//   	passport.serializeUser(function(user, done) {
//   		return done(null, user.id);
//   	});
//
//   	passport.deserializeUser(function(id, done) {
//   		User.findOne({
//   			_id: id
//   		}, "-password", function(err, user) {
//   			if (err)
//   				return done(err);
//
//   			return done(null, user);
//   		});
//   	});
//
// 	passport.use(new LocalStrategy({
// 		usernameField: "username",
// 		passwordField: "password",
// 		passReqToCallback : true
// 	}, function(req, username, password, done) {
//
//     console.log('inside passport use');
//     return User.findOne({
//
// 				"username": username
// 		}, function(err, user) {
// 			if (err)
// 				return done(err);
//
// 			if (!user)
// 				return done(null, false, {
// 					message: req.t("UnknowUsernameOrEmail")
// 				});
//
// 			user.comparePassword(password, function(err, isMatch) {
// 				if (err)
// 					return done(err);
//
// 				if (isMatch !== true)
// 					return done(null, false, {
// 						message: req.t("InvalidPassword")
// 					});
//
// 				else
// 					return done(null, user);
//
// 			});
// 		});
// 	}));
// };
