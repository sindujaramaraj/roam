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
	var path = "/v2/venues/search?near=";
	
	return {
		getVenues : function(params, callback) {
			console.log("Processing FS api for searchText=" + params.near)
			options.path = path + params.near + "&section=" + params.cat + "&radius=10000&limit=50&offset=10" + "&client_id=" + client_id + "&client_secret=" + client_secret;
			/*var cb = function(res) {
				res.on('data', function(data) {
					console.log(data);
				});
			};*/
			var req = https.request(options, callback);
			req.end();
			req.on("error", function(e) {
				console.error("Error: " + e);
			});
		}
	};
	
})();

module.exports =  new FSAPIConnector();