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
