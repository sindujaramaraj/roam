var https = require('https');
var ServerUtil = require('./serverUtil.js');

function FSAPIConnector() {
	
}

FSAPIConnector.prototype = (function() {
	var CLIENT_ID = "WHFYVWVXEC52X3ADBV3WGRNI1U3FBARJ3W2X1PGG4PQ0EQYA";
	var CLIENT_SECRET = "UOKUYUG5PO3LKKAERKI52PMNX1FPYFDHQ3FLEGHQSVFKJBGV";
	var FS_HOST_NAME = 'api.foursquare.com';
	var VENUE_PATH = "/v2/venues/";
	var AUTH_PARAMS = ["client_id=" + CLIENT_ID, "client_secret=" + CLIENT_SECRET];
	
	return {
		getVenues : function(params, callback) {
			console.log("Processing FS api for searchText=" + params.near);
			params.venuePhotos = 1;
			ServerUtil.makeHttpGet(FS_HOST_NAME, VENUE_PATH + "explore" + ServerUtil.getURLParams(params, AUTH_PARAMS), callback);
		},
		getCategories : function(params, callback) {
			console.log("Processing categories");
			this.makeHttpGet(FS_HOST_NAME, VENUE_PATH + "categories" + ServerUtil.getURLParams(params, AUTH_PARAMS), callback);
		}
	};
	
})();

module.exports =  new FSAPIConnector();