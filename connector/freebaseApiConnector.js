var ServerUtil = require('./serverUtil.js');

/**
 * Connector to interact with google Freebase Api's
 */
function FreebaseAPIConnector() {}

FreebaseAPIConnector.prototype = (function() {
	var API_KEY = 'AIzaSyDs6Zvokuo4OWar6C13oUGXiQNS811RAig';
	var GOOGLE_API_HOST_NAME = 'www.googleapis.com';
	var GOOGLE_TOPIC_API_PATH = '/freebase/v1/topic';
	var GOOGLE_MQL_READ_PATH = '/freebase/v1/mqlread';
	
	return {
		/**
		 * Fetch places from freebase by Country
		 */
		getPlacesForCountry: function(country, callback) {
			var query = [{
				"name": country,
				"id": null,
				"mid": null,
				"type": [],
				"/location/location/contains": [{
					"name": null,
				    "id": null,
				    "mid": null,
				    "type": "/travel/tourist_attraction",
				    "count": null,
				    "/location/location/geolocation": {
				      "latitude": null,
				      "longitude": null
				    },
				    "/common/topic/image":[{}]
				  }]
				}];
			this._getPlaces(query, callback);
		},
		/**
		 * Fetch places from Freebase by Locality
		 */
		getPlacesForLocality: function(locality, callback) {
			var query = [{
				"mid": null,
				"id": null,
				"name": locality,
				"/travel/travel_destination/tourist_attractions": [{
					"name": null,
				    "id": null,
				    "mid": null,
				    "count": null,
				    "type": [],
				    "/location/location/geolocation": {
				    	"latitude": null,
					    "longitude": null
				    },
				    "/common/topic/image":[{}]
				  }]
				}];
			/*freebase.paginate(query, function(response) {
				res.send(response);
			});*/
			this._getPlaces(query, callback);
		},
		_getPlaces: function(query, callback) {
			var params = ServerUtil.getURLParams({
				query: encodeURIComponent(JSON.stringify(query)),
				key: API_KEY
			});
			ServerUtil.makeHttpGet(GOOGLE_API_HOST_NAME, GOOGLE_MQL_READ_PATH + params, callback);
		},
		/**
		 * Fetch description of a place from freebase
		 */
		getDescription: function(id, callback) {
			var params = {
					key: API_KEY,
					filter: '/common/topic/description'
			};
			params = ServerUtil.getURLParams(params);
			ServerUtil.makeHttpGet(GOOGLE_API_HOST_NAME, GOOGLE_TOPIC_API_PATH + id + params, callback);
		}
	};
})();

module.exports = new FreebaseAPIConnector();