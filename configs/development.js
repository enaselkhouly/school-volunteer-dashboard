"use strict";

let pkg 			 = require("../package.json");

module.exports = {
		app: {
			title: pkg.name + " [Development mode]"
		},

		db: {
			url: process.env.MONGO_URI || "mongodb://localhost/" + pkg.config.dbName + "-dev",
			options: {
				user: "",
				pass: "",
				server: {
					socketOptions: {
						keepAlive: 1
					}
				}
			}
		},

		// Fake mailer
		mailer: {
			enabled: "true",
			from: 'School Dashboard <sender@example.com>',
			transporter: "smtp",
			smtp: {
				host: 'smtp.ethereal.email',
				port: 587,
				secure: false,
				auth: {
					user: 'hllmmt4fhdlbwkwk@ethereal.email',
	 				pass: '8s2txRyFJZDEux5grW'
				}
			}
		}

	};
