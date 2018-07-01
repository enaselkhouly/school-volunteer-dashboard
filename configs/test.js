"use strict";

let pkg = require("../package.json");

module.exports = {
	app: {
		title: pkg.name + " [Test mode]"
	},

	hashSecret: "71IIYMzMb0egTaCvvdijhUajAOjsrurzyRX5ziskMk4",
	sessionSecret: "MB9x-hOkx-UdcCbOprxggu-Wv1PetuoqzBny1h8DULA",

	test: true,

  db: {
		url: "mongodb://localhost/" + pkg.config.dbName + "-test",
		options: {
			user: "",
			pass: ""
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
