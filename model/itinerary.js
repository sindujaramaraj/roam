var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var itinerarySchema = new Schema({
	owner: String,
	destination: String,
	content: {},
	created: {type: Date, default: Date.now}
});

var Itinerary = mongoose.model('Itinerary', itinerarySchema);
module.exports = Itinerary;