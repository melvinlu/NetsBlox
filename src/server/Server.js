'use strict';
var express = require('express'),
    bodyParser = require('body-parser'),
    _ = require('lodash'),
    Utils = _.extend(require('./Utils'), require('./ServerUtils.js')),
    SocketManager = require('./SocketManager'),
    RoomManager = require('./rooms/RoomManager'),
    RPCManager = require('./rpc/RPCManager'),
    MobileManager = require('./mobile/MobileManager'),
    Storage = require('./storage/Storage'),
    Vantage = require('./vantage/Vantage'),

    // oauth2
    oauth2 = require('./oauth/oauth2'),
    hash = require('../common/sha512').hex_sha512,
    passport = require('passport'),

    engines = require('consolidate'),

    DEFAULT_OPTIONS = {
        port: 8080,
        vantagePort: 1234,
        vantage: true
    },

    // Mailer
    nodemailer = require('nodemailer'),
    markdown = require('nodemailer-markdown').markdown,
    transporter = nodemailer.createTransport(),  // TODO: Change to smtp

    // Routes
    createRouter = require('./CreateRouter'),
    path = require('path'),
    // Logging
    Logger = require('./logger'),

    // Session and cookie info
    sessionSecret = process.env.SESSION_SECRET || 'DoNotUseThisInProduction',
    expressSession = require('express-session'),
    cookieParser = require('cookie-parser');

var BASE_CLASSES = [
    SocketManager,
    RoomManager
];
var Server = function(opts) {
    this._logger = new Logger('NetsBlox');
    this.opts = _.extend({}, DEFAULT_OPTIONS, opts);
    this.app = express();

    // Mailer
    transporter.use('compile', markdown());

    // Mongo variables
    opts.transporter = transporter;
    this.storage = new Storage(this._logger, opts);
    this._server = null;

    // Group and RPC Managers
    this.rpcManager = new RPCManager(this._logger, this);
    this.mobileManager = new MobileManager(transporter);

    BASE_CLASSES.forEach(BASE => BASE.call(this, this._logger));
};

// Inherit from all the base classes
var classes = [Server].concat(BASE_CLASSES).map(fn => fn.prototype);
_.extend.apply(null, classes);

Server.prototype.configureRoutes = function() {
    this.app.set('views', __dirname + '/../client');
    this.app.engine('html', engines.ejs);
    this.app.set('view engine', 'ejs');

    this.app.use(express.static(__dirname + '/../client/editor'));
    this.app.use(cookieParser());
    this.app.use(bodyParser.urlencoded({
        extended: true
    }));
    this.app.use(bodyParser.json());

    // Session & Cookie settings
    this.app.use(expressSession({secret: sessionSecret}));
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    // CORS
    this.app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    // Add routes
    this.app.use('/rpc', this.rpcManager.router);
    this.app.use('/api', createRouter.call(this));

    // oauth2
    oauth2.init(this);
    this.app.get('/dialog/authorize', oauth2.authorization);
    this.app.post('/dialog/authorize/decision', oauth2.decision);
    this.app.post('/oauth/token', oauth2.token);

    // add login page for external usage
    this.app.get('/login', (req, res) =>
        res.sendFile(path.join(__dirname, '..', 'client', 'login.html'))
    );

    //this.app.post('/login', (req, res, next) => {
    this.app.post('/login', passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/login'
    }));

    //(req, res, next) => {
        //// TODO: logging in...
        //var username = req.body.username;
        //this.storage.users.get(username, (e, user) => {
            //if (e) {
                //return res.status(500).send(e);
            //}

            //if (!user) {
                //return res.status(404).send('User not found');
            //}

            //// TODO: Check the hash
            //if (user.hash === hash(req.body.password)) {
                //res.status(200).send('success');
            //} else {
                //return res.status(404).send('Invalid password');
            //}
        //});
    //});

    /*
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }
    });
    */


    // Initial page
    this.app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname, '..', 'client', 'editor', 'netsblox.html'));
    });
};

Server.prototype.start = function(done) {
    var self = this;
    done = done || Utils.nop;
    self.storage.connect(function (err) {
        if (err) {
            return done(err);
        }
        self.configureRoutes();
        self._server = self.app.listen(self.opts.port, function() {
            console.log('listening on port ' + self.opts.port);
            SocketManager.prototype.start.call(self, {server: self._server});
            // Enable Vantage
            if (self.opts.vantage) {
                new Vantage(self).start(self.opts.vantagePort);
            }
            done();
        });
    });
};

Server.prototype.stop = function(done) {
    done = done || Utils.nop;
    SocketManager.prototype.stop.call(this);
    this._server.close(done);
};

module.exports = Server;
