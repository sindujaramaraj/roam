var Model = require('perstore/model').Model,
	DefaultStore = require("perstore/stores").DefaultStore;

var store = new DefaultStore({log: false});

Itinerary = Model(store, {
	properties: {
		owner: {
			type: 'string'
		},
		destination: {
			type: 'string'
		},
		content: {
			type: 'json'
		}
	},
});