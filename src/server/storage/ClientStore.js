'use strict';

class ClientStore {
    constructor (logger, db) {
        this._logger = logger.fork('Clients');
        this._clients = db.collection('clients');
    }

    get (clientId, callback) {
        // Retrieve the client
        this._logger.trace(`getting ${clientId}`);
        this._clients.findOne({_id: clientId}, (e, data) => {
            var result = data;
            if (e) {
                this._logger.error(e);
            }
            if (data) {
                result.id = data._id;
            }
            this._logger.trace(`retrieved ${result}`);
            callback(e, result);
        });
    }

    new(name, clientId, secret) {
        // Consider adding restrictive scopes
        // TODO
        return this._clients.save({_id: clientId, name, secret})
            .then(result => {
                this._logger.trace(`created new client: ${clientId}`);
                if (result.writeError) {
                    this._logger.error('could not save to database: ' + result.errmsg);
                }
            });
    }
}

module.exports = ClientStore;
