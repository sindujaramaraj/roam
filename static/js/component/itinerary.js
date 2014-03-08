/**
 * New node file
 */
function Itinerary(config) {
	config = config || {};
	this.dayItinerary = config.dayItinerary || [] ;
}

Util.extend(Component, Itinerary, {
	render: function(h) {
		h.push('<div id="" class="">',
				'<div id="itineraryHeader"><h4>Itinerary</h4></div>');
		h.push('<div id="itiContent">');
		if (this.dayItinerary.length == 0) {
			h.push('<p class="text-muted">No items yet!</p>');
		} else {
			for (var idx = 0, len = this.dayItinerary.length; idx < len; idx++) {
				this.dayItinerary[idx].render(h);
			}
		}
		h.push('</div>');
		h.push('</div>');
	},
	addItem: function() {
		
	},
	removeItem: function() {
		
	}
});

function DayItinerary() {
	
}

Util.extend(DayItinerary, Component, {
	render: function(h) {
		
	}
});