// This will use the Bing traffic API to retrieve a list of traffic incidents and populate
// an array to return to the user (latitude, longitude, type)

'use strict';

var debug = require('debug'),
    log = debug('NetsBlox:RPCManager:Traffic:log'),
    error = debug('NetsBlox:RPCManager:Traffic:error'),
    trace = debug('NetsBlox:RPCManager:Traffic:trace'),
    API_KEY = process.env.BING_TRAFFIC_KEY,
    request = require('request'),
	baseUrl = 'http://dev.virtualearth.net/REST/v1/Traffic/Incidents/';

module.exports = {

    isStateless: true,
    getPath: () => '/traffic',
    getActions: () => ['search'], // function available to client

    // returns a list of traffic incidents as an array of 3 elements
    // 1: latitude
    // 2: longitude
    // 3: type (see Bing documentation for descriptions)
    search: function(req, res) {
    		// for bounding box
        var southLat = req.query.southLat,
            westLng = req.query.westLng,
            northLat = req.query.northLat,
            eastLng = req.query.eastLng,
         
            minSeverity = req.query.minSeverity,
            incidents = [],
            url = baseUrl + southLat + ',' + westLng + ',' + northLat + ',' + eastLng + '?key=' + API_KEY;

            if (minSeverity == undefined) {
                minSeverity = 0;
            }

    	request(url, function(err, response, body) {
    		
    		if (err) {
    			trace("Error:" + err);
    			return;
    		}

    		try {
    			body = JSON.parse(body);
    		} catch(e) {
    			trace("Non-JSON data...");
    			return;
    		}

    		if (body.statusCode == 400) {
    			trace("Invalid parameters...");
    			return;
    		}

            // populate the array as necessary
    		if (body.resourceSets[0].estimatedTotal != 0) {
            	for (var i = 0; i < body.resourceSets[0].resources.length; i++) {
            		if (body.resourceSets[0].resources[i].severity >= minSeverity) {
                		incidents.push(body.resourceSets[0].resources[i].point.coordinates[0]);
                		incidents.push(body.resourceSets[0].resources[i].point.coordinates[1]);
                		incidents.push(body.resourceSets[0].resources[i].type);
            		}
            	}
        	}

            return res.json(incidents);

    	});
    }
};