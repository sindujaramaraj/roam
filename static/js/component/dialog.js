/**
 * Base class that will open up a modal
 * Reuse the object by setting title and other options dynamically
 * @param config {
 * 					title: 'some string',
 * 					content: 'string or html',
 * 					buttons: [{
 * 						label: 'Button Label',
 * 						action: 'cancel|submit',
 * 						type: 'default|primary'
 * 					],
 * 					addCloseButton: true|false
 * 				}
 */
function Dialog(config) {
	this.register();
	this.title = config.title;
	this.content = config.content;
	this.buttons = config.buttons;
	this.addCloseButton = config.addCloseButton;
}

Util.extend(Component, Dialog, {
	setTitle: function(title) {
		this.title = title;
	},
	setContent: function(content) {
		this.content = content;
	},
	setButtons: function(buttons) {
		this.buttons = buttons;
	},
	render: function(h) {
		h.push('<div class="modal-dialog">',
		    '<div class="modal-content">',
		      '<div class="modal-header">',
		        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
		        '<h4 class="modal-title">', this.title, '</h4>',
		      '</div>',
		      '<div class="modal-body">',
		        '<p>', this.content, '</p>',
		      '</div>',
		      '<div class="modal-footer">');
				for (var idx = 0, len = this.buttons.length; idx < len; idx++) {
					h.push('<button type="button" class="acionBtn btn btn-',
							this.buttons[idx].type, '" action="', this.buttons[idx].action, '">', this.buttons[idx].label, '</button>');
				}
				if (this.addCloseButton) {
					h.push('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
				}
		h.push('</div>',
		    '</div>',//.modal-content
		  '</div>', // .modal-dialog
		'</div>');//.modal
	},
	addEvents: function() {
		var me = this;
		$('.modal-dialog button.acionBtn').click(function() {
			var actionNode = this.attributes['action'];
			if (actionNode) {
				me.dispatch('click', {
					action: actionNode.value
				});	
			}
		});
	}
});