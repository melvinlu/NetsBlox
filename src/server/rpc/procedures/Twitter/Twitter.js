// This will use the Twitter API to allow the client to execute certain Twitter functions
// within NetsBlox
// (xAuth for authentication?)
// utilize promises for asynchronous requesting?

'use strict';

var debug = require('debug'),
    log = debug('NetsBlox:RPCManager:Twitter:log'),
    error = debug('NetsBlox:RPCManager:Twitter:error'),
    trace = debug('NetsBlox:RPCManager:Twitter:trace'),
    request = require('request'),
    baseURL = 'https://api.twitter.com/1.1/',
    KEY = process.env.TWITTER_BEARER_TOKEN;

var options = {
	url: baseURL,
	headers: { 
		'Authorization': KEY,
		'gzip': true
		},
	json: true
};

module.exports = {

	isStateless: true,
	getPath: () => '/Twitter',
	getActions: () => ['RecentTweets', 'Followers', 'Tweets', 'Search', 'TweetsPerDay', 'Favorites', 'FavoritesCount'], // list of available functions for client to use

	// returns a list of a user's recent tweets
	RecentTweets: function(req, res) {

		var results = [];
		// gather parameters
		options.url = baseURL + 'statuses/user_timeline.json?';
		var screenName = req.query.screenName;
		var count = req.query.count;

		// ensure valid parameters
		if (screenName == '' || screenName == undefined || count == '' || count == undefined || count < 0) {
			trace('Enter valid parameters...');
			return res.send(false);
		}

		options.url = options.url + 'screen_name=' + screenName + '&count=' + count;

		// populate array of tweets
		getTweets();

		// repeat as many times as necessary
		function getTweets() {
			request(options, function(err, response, body) {
				for (var i = 0; i < body.length; i++) {
					results.push(body[i].text);
				}
				count -= body.length;
				options.url = baseURL + 'statuses/user_timeline.json?screen_name=' + screenName + '&count=' + count + '&max_id=' + body[body.length-1].id;
				if (count) {
					getTweets();
				} else {
					return res.json(results);
				}
			});
		}
	},

	// returns amount of followers a user has
	Followers: function(req, res) {

		// gather parameter
		options.url = baseURL + 'users/show.json?';
		var screenName = req.query.screenName;

		// ensure valid parameter
		if (screenName == '' || screenName == undefined) {
			trace('Enter a valid screen name...');
			return res.send(false);
		}

		options.url = options.url + 'screen_name=' + screenName;

		request(options, function(err, response, body) {
			return res.json(body.followers_count);
		});
	},

	// returns amount of tweets a user has
	Tweets: function(req, res) {

		// gather parameter
		options.url = baseURL + 'users/show.json?';
		var screenName = req.query.screenName;

		// ensure valid parameter
		if (screenName == '' || screenName == undefined) {
			trace('Enter a valid screen name...');
			return res.send(false);
		}

		options.url = options.url + 'screen_name=' + screenName;

		request(options, function(err, response, body) {
			return res.json(body.statuses_count);
		});
	},

	// searches the most recent tweets
	Search: function(req, res) {

		var results = [];
		// gather parameter
		options.url = baseURL + 'search/tweets.json?q=';
		var keyword = req.query.keyword;
		var count = req.query.count;

		// ensure valid parameters
		if (keyword == '' || keyword == undefined || count == '' || count == undefined || count < 0) {
			trace('Enter valid parameters...');
			return res.send(false);
		}

		// URL encode
		keyword = encodeURI(keyword);

		options.url = options.url + keyword + '&count=' + count;
		
		// populate array of tweets
		getTweets();

		// repeat as many times as necessary
		function getTweets() {
			request(options, function(err, response, body) {
				for (var i = 0; i < body.statuses.length; i++) {
					results.push('@' + body.statuses[i].user.screen_name + ": " + body.statuses[i].text);
				}
				count -= body.statuses.length;
				options.url = baseURL + 'search/tweets.json?q=' + keyword + '&count=' + count + '&max_id=' + body.statuses[body.statuses.length-1].id;
				if (count) {
					getTweets();
				} else {
					return res.json(results);
				}
			});
		}
	},

	// returns how many tweets per day the user averages (most recent 200)
	TweetsPerDay: function(req, res) {

		// gather parameter
		options.url = baseURL + 'statuses/user_timeline.json?';
		var screenName = req.query.screenName;
		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var dateToday = new Date();

		// ensure valid parameter
		if (screenName == '' || screenName == undefined) {
			trace('Enter valid parameters...');
			return res.send(false);
		}

		options.url = options.url + 'screen_name=' + screenName + '&count=200';

		request(options, function(err, response, body) {
			try {
				var oldestDate = new Date(body[body.length-1].created_at); 
				var diffDays = Math.round(Math.abs((oldestDate.getTime() - dateToday.getTime())/(oneDay)));
				return res.json(body.length / diffDays);
			} catch (err) {
				trace(err);
				return res.json(0);
			}
		});
	},

	// returns the most recent tweets that a user has favorited
	Favorites: function(req, res) {

		var results = [];
		// gather parameter
		options.url = baseURL + 'favorites/list.json?';
		var screenName = req.query.screenName;
		var count = req.query.count;

		// ensure valid parameter
		if (screenName == '' || screenName == undefined || count == '' || count == undefined || count < 0) {
			trace('Enter valid parameters...');
			return res.send(false);
		}

		options.url = options.url + 'screen_name=' + screenName + '&count=' + count;

		// populate array of tweets
		getTweets();

		// repeat as many times as necessary
		function getTweets() {
			request(options, function(err, response, body) {
				for (var i = 0; i < body.length; i++) {
					results.push('@' + body[i].user.screen_name + ": " + body[i].text);
				}
				count -= body.length;
				options.url = baseURL + 'favorites/list.json?screen_name=' + screenName + '&count=' + count + '&max_id=' + body[body.length-1].id;
				if (count) {
					getTweets();
				} else {
					return res.json(results);
				}
			});
		}
	},

	// returns the amount of favorites that a user has
	FavoritesCount: function(req, res) {

		// gather parameter
		options.url = baseURL + 'users/show.json?';
		var screenName = req.query.screenName;

		// ensure valid parameter
		if (screenName == '' || screenName == undefined) {
			trace('Enter valid parameters...');
			return res.send(false);
		}

		options.url = options.url + 'screen_name=' + screenName;

		request(options, function(err, response, body) {
			return res.json(body.favourites_count);
		});
	}

};