/**
 * Display and handles Itinerary
 * Shows distance between paths and total distance to travel
 * Suggests modes of communication
 */
function Itinerary(config) {
	this.register();
	this.init(config);
}

Util.extend(Component, Itinerary, {
	init: function(config) {
		this.activeItinerary = null;
		config = config || {};
		this.name = config.name;
		this.uid = config._id;
		this.owner = config.owner;
		this.destinations = config.destinations || [];
		this.dayItineraries = [];
		this.initDayItineraries(config.dayItinerary);
	},
	initDayItineraries: function(dayItineraries) {
		var me = this;
		dayItineraries.forEach(function(dayItinerary) {
			me.activeItinerary = me.addAnotherDay();
			var items = dayItinerary.items;
			items.forEach(function(item) {
				me.addItem(new ItineraryItem(item));
			});
		});
	},
	addDestination: function(destination) {
		this.destinations.push(destination);
	},	
	addAnotherDay: function() {
		var dayItinerary = new DayItinerary({});
		this.dayItineraries.push(dayItinerary);
		$('#itiContent').append(dayItinerary.getHtml());
		return dayItinerary;
	},
	addItem: function(itineraryItem) {
		if (!this.activeItinerary) {
			$('#itiContent').empty();
			var dayItinerary = this.addAnotherDay();
			this.activeItinerary = dayItinerary;
		}
		this.activeItinerary.addItem(itineraryItem);
	},
	removeItem: function(index) {
		
	},
	saveItinerary: function() {
		var data = this.getData();
		var me = this;
		Client.saveItinerary(data, function(response) {
			if (response.status == 'success') {
				alert(response.message);
				me.uid = response._id;
			}
		});
	},
	resetItinerary: function() {
		
	},
	findExistingItinerary: function() {
		Client.getItineraryByDestination(this.destination, function(response) {
			console.log(response);
		});
		return;
	},
	getData: function() {
		var itinerary = {
				dayItinerary: [],
				_id: this.uid,
				destination: this.destination,
				name: $('#itineraryHeader').text()
		};
		for (var idx = 0, len = this.dayItineraries.length; idx < len; idx++) {
			itinerary.dayItinerary.push(this.dayItineraries[idx].getData());
		}
		return itinerary;
	},
	render: function(h) {
		h.push('<div id="itineraryHeader" class="panel-heading">', this.name || 'Itinerary', '</div>');
		h.push('<div id="itiContent" class="panel-body"	>');
		if (this.dayItineraries.length == 0) {
			h.push('<p class="text-muted">No items yet!</p>');
		} else {
			for (var idx = 0, len = this.dayItineraries.length; idx < len; idx++) {
				this.dayItineraries[idx].render(h);
			}
		}
		h.push('</div>');
		h.push('<div id="itiFooter" class="panel-footer btn-toolbar">',
					'<button id="saveItinerary" type="button" class="btn btn-default btn-sm">Save</button>',
					'<button id="resetItinerary" type="button" class="btn btn-default btn-sm">Reset</button>',
				'</div>');
	},
	renderAsTile: function(h) {
		h.push('<div id="', this.uid, '" class="col-sm-6 col-md-4 itiTile">',
				'<div class="thumbnail">');
		h.push('<div class="caption"><h4>', this.name, '</h4>');
		h.push('<p>', this.getDestinationString(), '</p></div>');
		h.push('</div></div>');
	},
	getDestinationString: function() {
		var strArr = [];
		this.destinations.forEach(function(destination) {
			strArr.push(destination.name);
		});
		return strArr.join(', ');
	},
	addEvents: function() {
		var me = this;
		$('#itineraryHeader').click(function() {
			$('#itineraryHeader').attr('contenteditable', true);
		});
		$('#saveItinerary').click(function() {
			me.saveItinerary();
		});
		$('#resetItinerary').click(function() {
			me.resetItinerary();
		});
	},
	addTileEvents: function() {
		var me = this;
		$('#' + this.uid).click(function() {
			me.dispatch('action', {
				action: 'itinerarySelected'
			});
		});
	}
});

/**
 * 
 */
function DayItinerary(config) {
	this.register();
	this.itineraryItems = config.itineraryItems || [];
}

Util.extend(Component, DayItinerary, {
	render: function(h) {
		h.push('<div id="', this.id, '" class="dayIti">');
		if (this.itineraryItems.length) {
			for (var idx = 0, len = this.itineraryItems.length; idx < len; idx++) {
				this.itineraryItems[idx].render(h);
			}	
		} else {
			h.push('<p class="text-muted">No items yet!</p>');
		}
		h.push('</div>');
	},
	addItem: function(itineraryItem) {
		if (this.itineraryItems.length == 0) {
			$('#' + this.id).empty();
		}
		this.itineraryItems.push(itineraryItem);
		$('#' + this.id).append(itineraryItem.getHtml());
	},
	getData: function() {
		var dayItinerary = {
				items: []
		};
		for (var idx = 0, len = this.itineraryItems.length; idx < len; idx++) {
			dayItinerary.items.push(this.itineraryItems[idx].getData());
		}
		return dayItinerary;
	}
});

/**
 * 
 */
function ItineraryItem(config) {
	this.register();
	this.name = config.name;
	this.mid = config.mid;
	this.geoloc = config.geoloc;
}

Util.extend(Component, ItineraryItem, {
	render: function(h) {
		h.push('<div id="', this.id, '" class="itiItem">');
		h.push('<h6>', this.name, '</h6>');
		h.push('<button type="button" class="btn btn-default btn-xs">',
				'<span class="glyphicon glyphicon-remove"></span></button>');
		h.push('</div>');
	},
	getData: function() {
		var item = {
			mid: this.mid,
			name: this.name,
			geoloc: this.geoloc
		};
		return item;
	}
});