var itineraryModel = require('../model/itinerary.js');

module.exports.controller = function(app) {
	debugger;
	app.get('/saveItinerary', function(req, res) {
		debugger;
		var itinerary = req.query.itinerary;
		if (itinerary.rowId) {
			updateItinerary(itinerary);
		} else {
			createItinerary(itinerary);
		}
	});
	
	app.get('/getItinerary', function(req, res) {
		
	});
	
	app.get('getItineraryByDestination', function(req, res) {
		
	});
	
	function createItinerary(itinerary) {
		var model = new Itinerary(itinerary);
		model.save(function(err, obj) {
			if (err) {
				return console.error(err);	
			}
			debugger;
			console.log('saved');
			return obj;			
		});
	}
	
	function updateItinerary(itinerary) {
		
	}
};