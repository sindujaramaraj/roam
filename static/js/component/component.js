function Component() {
	
}

Component.prototype = (function() {
	var count = 0;
	
	return {
		register: function() {
			this._events = [],
			count++;
			this.id = 'c' + count;
		},
		getId: function() {
			return this.id;
		},
		render: function(h) {
			alert('Override this method');
		},
		renderInto: function(ele, append) {
			if (!append) {
				ele.empty();
			}
			ele.append(this.getHtml());
			this.addEvents();
		},
		addEvents: function() {
			
		},
		getHtml: function() {
			var h = [];
			this.render(h);
			return h.join('');
		},
		addEventListener: function(type, obj, callback) {
			this._events[type] = this._events[type] || [];
			this._events[type].push({
				obj: obj,
				callback: callback
			});
		},
		removeEventListener: function(type, obj) {
			var events = this._events[type];
			if (events) {
				for (var idx = 0, len = events.length; idx < len; idx++) {
					if (events[idx].obj === obj) {
						events.splice(idx, 1);
						break;
					}
				}
			}
		},
		dispatch: function(type, data) {
			var events = this._events[type];
			if (events && events.length) {
				for (var idx = 0, len = events.length; idx < len; idx++) {
					var callback = events[idx].callback;
					var params = {
							type: type,
							data: data,
							eventSource: this
						};
					if (typeof callback == 'string') {
						events[idx].obj[callback](params);
					} else if (typeof callback == 'function') {
						callback.apply(events[idx].obj, [params]);
					}
				}
			}
		}
	};
})(); 