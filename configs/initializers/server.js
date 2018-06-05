'use strict';

const
    express             = require('express'),
    bodyParser          = require('body-parser'),
    flash               = require("connect-flash"),
    methodOverride      = require("method-override"),
    path                = require('path');

module.exports = function() {
    let server = express(),
        create,
        start;

    create = function(config) {
        let routes    = require('../../src/routes');
        let passport  = require('./passport');

        // Server settings
        server.set('env', config.env);
        server.set('port', config.port);
        server.set('hostname', config.hostname);

        server.use(bodyParser.json());
        server.use(bodyParser.urlencoded({'extended':'false'}));
        server.use(methodOverride("_method"));

        let serverFolder = path.normalize(path.join(config.rootPath, "src"));

        server.set("views", path.join(serverFolder, "views"));
        server.use(express.static(path.join(serverFolder, "public"))); 

        // server.set('views', path.join(__dirname, '../../src/views'));
        server.set("view engine", config.viewEngine);

        server.use(flash());

        // Initialize passport
        passport.init(config, server);

        //Initialize flash messages
        server.use(function(req, res, next){
            res.locals.currentUser = req.user;
            res.locals.error       = req.flash("error");
            res.locals.success     = req.flash("success");
            next();
        });

        // Set up routes
        routes.init(server);
    };

    start = function() {
        let hostname = server.get('hostname'),
            port = server.get('port');

        server.listen(port, function () {
            console.log('Express server listening on - http://' + hostname + ':' + port);
        });
    };

    return {
        create: create,
        start: start
    };
};