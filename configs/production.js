"use strict";

let pkg 			 = require("../package.json");

module.exports = {
  app: {
    title: pkg.name + " [Production mode]"
  },

  sessions: {
		cookie: {
			// secure cookie should be turned to true to provide additional
			// layer of security so that the cookie is set only when working
			// in HTTPS mode.
			secure: false
		},
	},

  db: {
    url: process.env.MONGO_URI || "mongodb://localhost/" + pkg.config.dbName + "-production",
  },

};
