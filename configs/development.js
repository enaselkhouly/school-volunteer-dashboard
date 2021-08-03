"use strict";

let pkg 			 = require("../package.json");

module.exports = {
		app: {
			title: pkg.name + " [Development mode]"
		},

		db: {
			url: process.env.MONGO_URI || "mongodb://localhost/test",
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
	};
