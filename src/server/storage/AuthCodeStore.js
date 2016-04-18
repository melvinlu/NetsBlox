'use strict';

class AuthCodeStore {
    constructor (logger, db) {
        this._logger = logger.fork('AuthCodes');
        this._authCodes = db.collection('authcodes');
    }

    get (code, callback) {
        // Retrieve the client
        this._logger.trace(`getting ${code}`);
        this._authCodes.findOne({_id: code}, (e, data) => {
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

    new (code, clientId, uri, username) {
        // Consider adding restrictive scopes
        // TODO
        var authCode = {_id: code, clientId, uri, username};
        return this._authCodes.save(authCode)
            .then(result => {
                this._logger.trace(`created new client: ${code}`);
                if (result.writeError) {
                    this._logger.error('could not save to database: ' + result.errmsg);
                }
                authCode.code = authCode._id;
                return authCode;
            });
    }
}

module.exports = AuthCodeStore;
