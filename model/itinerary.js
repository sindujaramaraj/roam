var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var itinerarySchema = new Schema({
	owner: String,
	name: String,
	description: String,
	destination: [],
	dayItinerary: [],
	created: {"type": Date, "default": Date.now}
});

itinerarySchema.statics.findItinerariesByUser = function(user, cb) {
	this.find({
		owner: user
	}, cb);
};

var Itinerary = mongoose.model('Itinerary', itinerarySchema);
module.exports = Itinerary;

