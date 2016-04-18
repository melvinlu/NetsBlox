'use strict';
var MongoClient = require('mongodb').MongoClient,
    ClientStore = require('./ClientStore'),
    AuthCodeStore = require('./AuthCodeStore'),
    UserStore = require('./UserStore'),
    RoomStore = require('./RoomStore');


var Storage = function(logger, opts) {
    this._logger = logger.fork('Storage');
    this._mongoURI = opts.mongoURI || 'mongodb://localhost:27017';
    this._transporter = opts.transporter;

    this.users = null;
    this.rooms = null;

    // oauth
    this.clients = null;
    this.authCodes = null;
    this.accessTokens = null;
};

Storage.prototype.connect = function(callback) {
    MongoClient.connect(this._mongoURI, (err, db) => {
        if (err) {
            throw err;
        }

        this.users = new UserStore(this._logger, db, this._transporter);
        this.rooms = new RoomStore(this._logger, db);
        this.clients = new ClientStore(this._logger, db);
        this.authCodes = new AuthCodeStore(this._logger, db);

        this.clients.new('TestClient', 'c_1', 'password');  // REMOVE

        // TODO: Add clients, authCodes, accessTokens
        this.onDatabaseConnected();

        console.log('Connected to '+this._mongoURI);
        callback(err);
    });
};

Storage.prototype.onDatabaseConnected = function() {
};

module.exports = Storage;
