/**
 * Module dependencies.
 */
var passport = require('passport'),
  hash = require('../../common/sha512').hex_sha512,
  LocalStrategy = require('passport-local').Strategy,
  BasicStrategy = require('passport-http').BasicStrategy,
  ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
  BearerStrategy = require('passport-http-bearer').Strategy,
  self;


exports.init = (_self) => self = _self;

/**
* LocalStrategy
*
* This strategy is used to authenticate users based on a username and password.
* Anytime a request is made to authorize an application, we must ensure that
* a user is logged in before asking them to approve the request.
*/
passport.use(new LocalStrategy(
    function(username, password, done) {
        self._logger.trace(`Authenticating with LocalStrategy`);
        self.storage.users.get(username, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (user.hash != hash(password)) {
                self._logger.info(`Failed login attempt for ${username}`);
                return done(null, false);
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    self._logger.trace(`Serializing user: ${user.username}`);
    done(null, user.username);
});

passport.deserializeUser(function(id, done) {
    self._logger.trace(`Deserializing user: ${id}`);
    self.storage.users.get(id, function (err, user) {
        done(err, user);
    });
});


/**
* BasicStrategy & ClientPasswordStrategy
*
* These strategies are used to authenticate registered OAuth clients.  They are
* employed to protect the `token` endpoint, which consumers use to obtain
* access tokens.  The OAuth 2.0 specification suggests that clients use the
* HTTP Basic scheme to authenticate.  Use of the client password strategy
* allows clients to send the same credentials in the request body (as opposed
* to the `Authorization` header).  While this approach is not recommended by
* the specification, in practice it is quite common.
*/
passport.use(new BasicStrategy(
    function(username, password, done) {
        self._logger.trace(`Looking up clientId: ${username} (BasicStrategy)`);
        self.storage.clients.get(username, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.secret != password) { return done(null, false); }
            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        self._logger.trace(`Looking up clientId: ${clientId} (ClientPasswordStrategy)`);
        self.storage.clients.get(clientId, function(err, client) {
            if (err) { return done(err); }
            self._logger.trace(`Found client ${clientId}`);
            if (!client) { return done(null, false); }
            if (client.secret != clientSecret) { return done(null, false); }
            return done(null, client);
        });
    }
));

/**
* BearerStrategy
*
* This strategy is used to authenticate either users or clients based on an access token
* (aka a bearer token).  If a user, they must have previously authorized a client
* application, which is issued an access token to make requests on behalf of
* the authorizing user.
*/
passport.use(new BearerStrategy(
    function(accessToken, done) {
        self._logger.trace(`Looking up accessToken: ${accessToken} (BearerStrategy)`);
        self.storage.accessTokens.get(accessToken, function(err, token) {
            if (err) { return done(err); }
            if (!token) { return done(null, false); }

            if(token.userID != null) {
                self.storage.users.find(token.userID, function(err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false); }
                    // to keep this example simple, restricted scopes are not implemented,
                    // and this is just for illustrative purposes
                    var info = { scope: '*' }
                    done(null, user, info);
                });
            } else {
                //The request came from a client only since userID is null
                //therefore the client is passed back instead of a user
                self.storage.clients.get(token.clientID, function(err, client) {
                    if(err) { return done(err); }
                    if(!client) { return done(null, false); }
                    // to keep this example simple, restricted scopes are not implemented,
                    // and this is just for illustrative purposes
                    var info = { scope: '*' }
                    done(null, client, info);
                });
            }
        });
    }
));
