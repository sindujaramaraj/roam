var ServerUtil = require('./serverUtil.js');

/**
 * Google API connector
 */
function GoogleAPIConnector() {}

GoogleAPIConnector.prototype = (function() {
	var PLACES_PATH = '/maps/api/place/details/json';
	var API_KEY = 'AIzaSyDs6Zvokuo4OWar6C13oUGXiQNS811RAig';
	var PLACES_PARAMS = {
			key: API_KEY,
			sensor: 'false'
	};
	var GOOGLE_MAPS_HOST_NAME = 'maps.googleapis.com';
	
	return {
		getPlaceDetails: function(reference, callback) {
			console.log('Calling getDetails for referece: ' + reference);
			PLACES_PARAMS.reference = reference;
			var params = ServerUtil.getURLParams(PLACES_PARAMS);
			ServerUtil.makeHttpGet(GOOGLE_MAPS_HOST_NAME, PLACES_PATH + params, callback);
		},
		getDistance: function() {
			
		}
	};
})();

module.exports = new GoogleAPIConnector();