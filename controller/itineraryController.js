var Itinerary = require('../model/itinerary.js');

/**
 * Itinerary controller is responsibe for
 * handling all itinerary related get and post methods
 */
module.exports.controller = function(app) {
	/**
	 * Saves the itinerary to the repository
	 * Creates or saves an itinerary based on the id
	 */
	app.post('/saveItinerary', function(req, res) {
		var itinerary = req.body.itinerary;
		if (itinerary.id) {
			updateItinerary(itinerary);
		} else {
			createItinerary(itinerary);
		}
	});
	
	/**
	 * Retrieve ans itinerary by id
	 */
	app.get('/getItinerary', function(req, res) {
		var id = req.query.id;
		Itinerary.find({
			_id: id
		}, function(err, itineraries) {
			
		});
	});
	
	/**
	 * Get all available itineraries in the repository
	 */
	app.get('/getAllItinerary', function(req, res) {
		Itinerary.find(function(err, itineraries) {
			
		});
	});
	
	/**
	 * Get all itineraries for a particular destination
	 */
	app.get('/getItineraryByDestination', function(req, res) {
		var destination = req.query.destination;
		Itinerary.find({
			destination: destination
		}, function(err, itineraries) {
			console.log('Found ' + itineraries.length + ' itineraries');
			res.send(itineraries);
		});
	});
	
	/**
	 * Saves itinerary
	 */
	function createItinerary(itinerary) {
		var model = new Itinerary(itinerary);
		model.save(function(err, obj) {
			if (err) {
				return console.error(err);	
			}
			console.log('saved');
			return obj;			
		});
	}
	
	/**
	 * Updates existing itinerary
	 */
	function updateItinerary(itinerary) {
		
	}
};