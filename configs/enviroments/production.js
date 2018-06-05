'use strict';
let path = require('path');

let rootPath = path.normalize(path.join(__dirname, "..", ".."));

let localConfig = {
    viewEngine: 'ejs',
    secret: "I am so grateful for everything in my life!",
    rootPath: 'rootPath'
};

module.exports = localConfig;
