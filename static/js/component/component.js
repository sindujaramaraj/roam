function Component() {
	
}

Component.prototype = {
	render: function(h) {
		alert('Override this method');
	},
	getHtml: function() {
		var h = [];
		this.render(h);
		return h.join('');
	}
};