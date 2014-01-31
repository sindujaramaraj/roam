var ServerUtil = require('./serverUtil.js');
var freebase = require('freebase');

function FreebaseAPIConnector() {
	
}

FreebaseAPIConnector.prototype = (function() {
	var FREEBASE_HOST_NAME = 'api.freebase.com';
	var FREEBASE_MQL_PATH = '/api/service/mqlread';
	var API_KEY = 'AIzaSyDs6Zvokuo4OWar6C13oUGXiQNS811RAig';
	var GOOGLE_API_HOST_NAME = 'www.googleapis.com';
	var GOOGLE_TOPIC_API_PATH = '/freebase/v1/topic';
	
	return {
		getPlacesForCountry: function(country, res) {
			var query = [{
				  "type": "/location/country",
				  "name": country,
				  "id": null,
				  "mid": null,
				  "/location/location/contains": [{
				    "name": null,
				    "id": null,
				    "mid": null,
				    "type": "/travel/tourist_attraction",
				    "count": null,
				    "/location/location/geolocation": {
				      "latitude": null,
				      "longitude": null
				    }
				  }]
				}];
			freebase.paginate(query, function(response) {
				res.send(response);
			});
			/*var params = ServerUtil.getURLParams({query: JSON.stringify(query)});
			ServerUtil.makeHttpGet(FREEBASE_HOST_NAME, FREEBASE_MQL_PATH + params, callback);*/
		},
		getDetailsForPlace: function(place, res) {
			
		},
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