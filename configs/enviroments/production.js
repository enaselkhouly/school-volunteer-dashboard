'use strict';
let path = require('path');

let rootPath = path.normalize(path.join(__dirname, "..", ".."));

let localConfig = {
    hostname: 'sch-volunteer-dashboard.herokuapp.com/'
    viewEngine: 'ejs',
    secret: "I am so grateful for everything in my life!",
    rootPath: 'rootPath'
};

module.exports = localConfig;
