'use strict';

const mongoose = require('mongoose');

function connect (config) {

		mongoose.Promise = require('bluebird');
		var dbURL = process.env.DATABASEURL || config.dbURL;
		mongoose.connect(dbURL);
		console.log('Database is connected');
}


module.exports = {
    connect: connect
}; //module.exports
