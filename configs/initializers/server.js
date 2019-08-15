'use strict';

const
    express             = require('express'),
    bodyParser          = require('body-parser'),
    flash               = require("connect-flash"),
    methodOverride      = require("method-override"),
    path                = require('path'),
    helmet              = require('helmet'),
    crossdomain         = require('helmet-crossdomain'),
    session 		        = require("express-session"),
    mongoose            = require("mongoose"),
    MongoStore 		      = require("connect-mongo")(session);

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

        server.set("view engine", config.viewEngine);

        server.use(flash());

        // Use helmet to secure Express headers
        server.use(helmet.xssFilter({ setOnOldIE: true }));
        server.use(helmet.noSniff());
        server.use(helmet.frameguard());
        server.use(helmet.ieNoOpen());
        server.use(crossdomain());
        server.use(helmet.hidePoweredBy());

        // trust first proxy
        server.set('trust proxy', 1)

        // Express MongoDB session storage
        server.use(session({
          saveUninitialized: true,
          resave: false,
          secret: config.sessionSecret,
          store: new MongoStore({
            mongooseConnection: mongoose.connection,
            collection: config.sessions.collection,
            autoReconnect: true
          }),
          /*Preventing XSS vulnerabilities*/
          cookie: config.sessions.cookie,
          name: config.sessions.name
        }));

        // Initialize passport
        passport.init(config, server);

        // JWT setup
        // server.use((req, res, next) => {
        //     if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        //        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', (err, decode) => {
        //            if (err) req.user = undefined;
        //            req.user = decode;
        //            next();
        //        });
        //     } else {
        //         req.user = undefined;
        //         next();
        //     }
        // });

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
            port = process.env.PORT || server.get('port');

        server.listen(port, function () {
            console.log('Express server listening on - http://'+ hostname +':' + port);
        });
    };

    return {
        create: create,
        start: start,
        server : server
    };
};
