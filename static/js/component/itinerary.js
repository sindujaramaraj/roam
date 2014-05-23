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
			me.addAnotherDay();
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
		var dayItinerary = new DayItinerary({
			day: this.dayItineraries.length + 1
		});
		dayItinerary.addEventListener('action', this, this.handleDayEvents);
		this.dayItineraries.push(dayItinerary);
		$('#' + this.id + '_itiContent').append(dayItinerary.getHtml());
		dayItinerary.addEvents();
		this.activeItinerary = dayItinerary;
		return dayItinerary;
	},
	handleDayEvents: function(evt) {
		if (evt.data.action == 'selected') {
			this.activeItinerary.makeUnSelected();
			this.activeItinerary = evt.eventSource;
			this.activeItinerary.makeSelected();
		}
	},
	addItem: function(itineraryItem) {
		if (!this.activeItinerary) {
			$('#' + this.id + '_itiContent').empty();
			this.addAnotherDay();
		}
		this.activeItinerary.addItem(itineraryItem);
	},
	removeDay: function(index) {
		
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
				name: $('#' + this.id + '_itineraryHeader').text()
		};
		for (var idx = 0, len = this.dayItineraries.length; idx < len; idx++) {
			itinerary.dayItinerary.push(this.dayItineraries[idx].getData());
		}
		return itinerary;
	},
	render: function(h) {
		h.push('<div id="', this.id, '_itineraryHeader" class="panel-heading">', this.name || 'Itinerary', '</div>');
		h.push('<div id="', this.id, '_itiContent" class="panel-body"	>');
		if (this.dayItineraries.length == 0) {
			h.push('<p class="text-muted">No items yet!</p>');
		} else {
			for (var idx = 0, len = this.dayItineraries.length; idx < len; idx++) {
				this.dayItineraries[idx].render(h);
			}
		}
		h.push('</div>');
		h.push('<div id="', this.id, '_itiFooter" class="panel-footer btn-toolbar">',
				'<button id="addDay" type="button" class="btn btn-default btn-sm">Add Day</button>',	
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
		$('#' + this.id + '_itineraryHeader').click(function() {
			$(this).attr('contenteditable', true);
		});
		$('#addDay').click(function() {
			var dayItinerary = me.addAnotherDay();
			me.activeItinerary = dayItinerary; 
		});
		$('#saveItinerary').click(function() {
			me.saveItinerary();
		});
		$('#resetItinerary').click(function() {
			me.resetItinerary();
		});
		this.addDayEvents();
	},
	addDayEvents: function() {
		this.dayItineraries.forEach(function(dayItinerary) {
			dayItinerary.addEvents();
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
	this.day = config.day;
	this.itineraryItems = config.itineraryItems || [];
}

Util.extend(Component, DayItinerary, {
	render: function(h) {
		h.push('<div id="', this.id, '" class="dayIti">');
		if (this.day) {
			h.push('<a id="', this.id, '_day" class="btn label label-default btn-sm">Day ', this.day, '</a>');
		}
		h.push('<div id="', this.id, '_items">');
		this.renderItems(h);
		h.push('</div></div>');
	},
	renderItems: function(h) {
		if (this.itineraryItems.length) {
			for (var idx = 0, len = this.itineraryItems.length; idx < len; idx++) {
				this.itineraryItems[idx].render(h);
			}	
		} else {
			h.push('<p class="text-muted">No items yet!</p>');
		}
	},
	addEvents: function() {
		this.itineraryItems.forEach(function(item) {
			item.addEvents();
		});
		var me = this;
		$('#' + this.id + '_day').click(function() {
			me.dispatch('action', {
				action: 'selected'
			});
		});
	},
	makeSelected: function() {
		$('#' + this.id + '_day').switchClass('label-default', 'label-primary');
	},
	makeUnSelected: function() {
		$('#' + this.id + '_day').switchClass('label-primary', 'label-default');
	},
	addItem: function(itineraryItem) {
		if (this.itineraryItems.length == 0) {
			$('#' + this.id + '_items').empty();
		}
		this.itineraryItems.push(itineraryItem);
		$('#' + this.id + '_items').append(itineraryItem.getHtml());
		itineraryItem.addEvents();
		itineraryItem.addEventListener('action', this, this.handleItineraryItem);
	},
	handleItineraryItem: function(evt) {
		if (evt.data.action == 'delete') {
			this.removeItem(evt.eventSource);
		}
	},
	removeItem: function(item) {
		var index = this.itineraryItems.indexOf(item);
		item.removeEventListener('action', this);
		this.itineraryItems.splice(index, 1);
		//re render
		var h = [];
		this.renderItems(h);
		$('#' + this.id + '_items').html(h.join(''));
		this.addEvents();
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
		h.push('<span>', this.name, '</span>');
		h.push('<button id="', this.id, '_deleteBtn" type="button" class="btn btn-default btn-xs">',
				'<span class="glyphicon glyphicon-remove"></span></button>');
		h.push('</div>');
	},
	addEvents: function() {
		var me = this;
		$('#' + this.id + '_deleteBtn').click(function() {
			me.dispatch('action', {
				action: 'delete'
			});
		});
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