"use strict";

let path  = require("path");
let pkg   = require("../package.json");

module.exports = {
	app: {
		title: pkg.title,
		version: pkg.version,
		description: pkg.description,
		url: process.env.APPURL || "http://localhost:" + (process.env.PORT || 3000) + "/",
		contactEmail: ""
	},

  sessions: {
		cookie: {
			// session expiration is set by default to 10 hrs
			maxAge: 10 * (60 * 60 * 1000),

			// httpOnly flag makes sure the cookie is only accessed
			// through the HTTP protocol and not JS/browser
			httpOnly: true,

			// secure cookie should be turned to true to provide additional
			// layer of security so that the cookie is set only when working
			// in HTTPS mode.
			secure: false,
      resave: false
		},

		// Cookie key name
		name: "sessionId",

		// Mongo store collection name
		collection: "sessions"
	},

  // Fake mailer
  mailer: {
    enabled: "true",
    // from: 'School Dashboard <sender@example.com>',
    // transporter: "smtp",
    smtp: {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secureConnection: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    },
    // service: 'Hotmail'
  },

	ip: process.env.NODE_IP || "0.0.0.0",
	port: process.env.PORT || 3000,
	hostname: process.env.HOSTNAME || 'localhost',

	rootPath: global.rootPath,
	dataFolder: path.join(global.rootPath, "data"),
	viewEngine: 'ejs',

	test: false,

	features: {
  }
};
