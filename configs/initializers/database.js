'use strict';

const mongoose = require('mongoose');

function connect (config) {

		mongoose.Promise = require('bluebird');
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);

		const dbURL = process.env.DATABASEURL || config.db.url;

    mongoose.connect(dbURL, function(err) {
      if (err) {
        console.log(err.message);
      }
    });

    console.log('Database is connected on: ', dbURL);
}


module.exports = {
    connect: connect
}; //module.exports
