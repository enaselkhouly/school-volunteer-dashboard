'use strict';

const mongoose = require('mongoose');

function connect (config) {

		mongoose.Promise = require('bluebird');
		const dbURL = process.env.DATABASEURL || config.db.url;
		console.log(dbURL);
		mongoose.connect(dbURL);
		console.log('Database is connected...');
}


module.exports = {
    connect: connect
}; //module.exports
