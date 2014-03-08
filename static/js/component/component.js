function Component() {
	
}

Component.prototype = {
	_events: [],
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
	dispatch: function(type, data) {
		var events = this._events[type];
		if (events && events.length) {
			for (var idx = 0, len = events.length; idx < len; idx++) {
				var callback = events[idx].callback;
				var params = {
						type: type,
						data: data,
						eventSource: arguments.callee.caller
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