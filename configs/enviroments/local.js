'use strict';
let path = require('path');

let rootPath = path.normalize(path.join(__dirname, "..", ".."));

let localConfig = {
    hostname: 'localhost',
    port: 3000,
    viewEngine: 'ejs',
    dbURL: "mongodb://localhost/men-dashboard",
    secret: "I am so grateful for everything in my life!",
    rootPath: rootPath
};

module.exports = localConfig;
