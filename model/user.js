var Model = require('perstore/model').Model,
	DefaultStore = require("perstore/stores").DefaultStore;

var store = new DefaultStore({log: false});

User = Model(store, {
	properties: {
		name: {
			type: 'string',
		},
		email: {
			type: 'string'
		},
		password: {
			type: 'string'
		}
	},
	links: [{
		rel: 'itineraries',
		href: '../Itinerary?user={id}'
	}]
});

require('')