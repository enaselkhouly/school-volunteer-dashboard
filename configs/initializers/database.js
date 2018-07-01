'use strict';

const mongoose = require('mongoose');

function connect (config) {

		mongoose.Promise = require('bluebird');
		const dbURL = process.env.DATABASEURL || config.db.url;
		mongoose.connect(dbURL);
		console.log('Database is connected on: ', dbURL);
}


module.exports = {
    connect: connect
}; //module.exports
