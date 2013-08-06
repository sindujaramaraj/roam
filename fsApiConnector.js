var https = require('https');

function FSAPIConnector() {
	
}

FSAPIConnector.prototype = (function() {
	var client_id = "WHFYVWVXEC52X3ADBV3WGRNI1U3FBARJ3W2X1PGG4PQ0EQYA";
	var client_secret = "UOKUYUG5PO3LKKAERKI52PMNX1FPYFDHQ3FLEGHQSVFKJBGV";
	var options = {
		hostname : 'api.foursquare.com',
		method : 'GET'
	};
	var venuePath = "/v2/venues/";
	var authParams = ["client_id=" + client_id, "client_secret=" + client_secret];
	
	function getURLParams(params) {
		var paramsArr = authParams.slice();
		var value;
		for (key in params) {
			value = params[key];
			if (value == null || typeof value == "undefined") {
				continue;
			}
			paramsArr.push(key + "=" + params[key]);
		}
		return "?" + paramsArr.join('&');
	}
	
	return {
		getVenues : function(params, callback) {
			console.log("Processing FS api for searchText=" + params.near);
			params.venuePhotos = 1;
			options.path = venuePath + "explore" + getURLParams(params);
			this.makeHttpGet(callback);
		},
		getCategories : function(params, callback) {
			console.log("Processing categories");
			options.path = venuePath + "categories" + getURLParams(params);
			this.makeHttpGet(callback);
		},
		makeHttpGet : function(callback) {
			console.log("Query: " + options.path);
			var req = https.request(options, callback);
			req.end();
			req.on("error", function(e) {
				console.error("Error: " + e);
			});
		}
	};
	
})();

module.exports =  new FSAPIConnector();