/**
 * Display and handles Itinerary
 * Shows distance between paths and total distance to travel
 * Suggests modes of communication
 */
function Itinerary(config) {
	config = config || {};
	this.register();
	this.rowId = config.rowId;
	this.destination = config.destination;
	this.dayItineraries = config.dayItineraries || [] ;
	this.activeItinerary = null;
}

Util.extend(Component, Itinerary, {
	setDestination: function(destination) {
		this.destination = destination;
	},
	render: function(h) {
		h.push('<div id="itineraryHeader" class="panel-heading">Itinerary</div>');
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
	addEvents: function() {
		var me = this;
		$('#saveItinerary').click(function() {
			me.saveItinerary();
		});
		$('#resetItinerary').click(function() {
			me.resetItinerary();
		});
	},
	saveItinerary: function() {
		var data = this.getData();
		/*this.dispatch('action', {
			action: 'save',
			data: data
		});*/
		Client.saveItinerary(data, function(response) {
			alert(response);
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
				rowId: this.rowId,
				destination: this.destination
		};
		for (var idx = 0, len = this.dayItineraries.length; idx < len; idx++) {
			itinerary.dayItinerary.push(this.dayItineraries[idx].getData());
		}
		return itinerary;
	},
	addItem: function(itineraryItem) {
		if (!this.activeItinerary) {
			var dayItinerary = new DayItinerary({});
			this.activeItinerary = dayItinerary;
			this.dayItineraries.push(dayItinerary);
			$('#itiContent').empty();
			$('#itiContent').append(dayItinerary.getHtml());
		}
		this.activeItinerary.addItem(itineraryItem);
	},
	removeItem: function(index) {
		
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