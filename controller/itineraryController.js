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
		function errCallback(err) {
			res.send({
				status: 'error',
				message: err
			});
		}
		if (itinerary._id) {
			updateItinerary(itinerary, function(itinerary) {
				res.send({
					status: 'success',
					message: 'Itinerary updated'
				});
			}, errCallback);
		} else {
			itinerary.owner = req.session['user'];
			saveItinerary(itinerary, function(itinerary) {
				res.send({
					status: 'success',
					message: 'Itinerary saved',
					_id: itinerary._id
				});
			}, errCallback);
		}
	});
	
	/**
	 * Retrieve ans itinerary by id
	 */
	app.get('/getItinerary', function(req, res) {
		var id = req.query["id"];
		Itinerary.find({
			_id: id
		}, function(err, itineraries) {
			
		});
	});
	
	app.get('/getMyItineraries', function(req, res) {
		var user = req.session['user'];
		Itinerary.findItinerariesByUser(user, function(err, itineraries) {
			if (err) {
				res.send({
					status: 'error',
					message: err
				});
				return;
			}
			if (itineraries && itineraries.length) {
				res.send({
					status: 'success',
					itineraries: itineraries
				});
			} else {
				res.send({
					status: 'failure',
					message: 'You haven\'t created itineraries yet!'
				});
			}
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

	app.post('/clearAllItineraries', function(req, res) {
		Itinerary.find(function(err, itineraries) {
			if (err) {
				console.error(err);
			} else {
				itineraries.forEach(function(itinerary) {
					itinerary.remove();
				});
			}
		});
	});
	/**
	 * Saves itinerary
	 */
	function saveItinerary(itinerary, callback, errCallback) {
		var model = new Itinerary(itinerary);
		model.save(function(err, obj) {
			if (err) {
				console.error(err);
				errCallback(err);
			} else {
				return callback(obj);	
			}			
		});
	}
	
	/**
	 * Updates an existing itinerary
	 */
	function updateItinerary(itinerary, callback, errCallback) {
		var id = itinerary._id;
		delete itinerary._id;
		Itinerary.update({
			_id: id
		}, itinerary, {}, function(err, obj) {
			if (err) {
				console.error(err);
				errCallback(err);
			} else {
				return callback(obj);	
			}
		});
	}
};