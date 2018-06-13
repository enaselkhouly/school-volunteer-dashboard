"use strict";

let path 	= require("path");
let fs 		= require("fs");
let _ 		= require("lodash");
let chalk	= require("chalk");
let tokgen	= require("../libs/tokgen");

global.rootPath = path.normalize(path.join(__dirname, ".."));

console.log("process.argv: " + process.argv);

console.log("Application root path: " + global.rootPath);

/* Export build mode */
module.exports = {

	isDevelopmentMode() {
		return !process.env.NODE_ENV || process.env.NODE_ENV === "development";
	},

	isProductionMode() {
		return process.env.NODE_ENV === "production";
	},

	isTestMode() {
		return process.env.NODE_ENV === "test";
	}
};

// Read the base configurations
let baseConfig = require("./base");

// Read per mode configurations
let config = {};
if (module.exports.isTestMode()) {
	console.log("Load test config...");
	config = require("./test");
}
else if (module.exports.isDevelopmentMode()){
  console.log("Load development config...");
	config = require("./development");
}
else if (module.exports.isProductionMode()) {
	console.log("Load production config...");
	config = require("./production");
}

// Read the extra configurations
let externalConfig = {
	hashSecret: tokgen(),
	sessionSecret: tokgen()
}
module.exports = _.defaultsDeep(externalConfig, config, baseConfig, module.exports);
