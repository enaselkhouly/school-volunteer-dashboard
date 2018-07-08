"use strict";

let path  = require("path");
let pkg   = require("../package.json");

module.exports = {
	app: {
		title: pkg.title,
		version: pkg.version,
		description: pkg.description,
		url: "http://localhost:" + (process.env.PORT || 3000) + "/",
		contactEmail: ""
	},

  sessions: {
		cookie: {
			// session expiration is set by default to two hours
			maxAge: 2 * (60 * 60 * 1000),

			// httpOnly flag makes sure the cookie is only accessed
			// through the HTTP protocol and not JS/browser
			httpOnly: true,

			// secure cookie should be turned to true to provide additional
			// layer of security so that the cookie is set only when working
			// in HTTPS mode.
			secure: false
		},

		// Cookie key name
		name: "sessionId",

		// Mongo store collection name
		collection: "sessions"
	},

	ip: process.env.NODE_IP || "0.0.0.0",
	port: process.env.PORT || 3000,
	hostname: process.env.PORT || 'localhost',

	rootPath: global.rootPath,
	dataFolder: path.join(global.rootPath, "data"),
	viewEngine: 'ejs',

	test: false,

	features: {
  }
};
