/**
 * UI component that will represent a place
 * with text and images
 * @param config {
 * 					images: [{link: ..., text: ...}],
 * 					name: ...
 * 					mid: ...
 * 				}
 */

function Tile(config) {
	this.init(config);
}

Util.extend(Component, Tile, (function() {

	var tileDialog = null;
	var dialogContainer = $('#dialogContainer');
	
	var dialogButtons = [{
		label: 'Add',
		type: 'primary',
		action: 'addToItinery'
	}, {
		label: 'Remove',
		type: 'danger',
		action: 'removeFromItinery'
	}];
	
	var imagePrefix = 'https://usercontent.googleapis.com/freebase/v1/image/';
	
	function getImageUrl(imageId) {
		return imagePrefix + imageId;
	}
	
	return {
		init: function(config) {
			this.register();
			this.mid = config.mid;
			this.images = config.images || [];
			this.name = config.name;
			this.descriptionLoaded = false;
		},
		setDescription: function(description) {
			this.description = description;
			this.descriptionLoaded = true;
		},
		getMid: function() {
			return this.mid;
		},
		isDescriptionLoaded: function() {
			return this.descriptionLoaded;
		},
		render: function(h) {
			h.push('<div class="col-sm-6 col-md-4" id="', this.id, '">');
			h.push('<div class="thumbnail" id="', this.id + '_thumbnail', '">');
			h.push('<div class="tileContent" id="', this.id, '_tileContent">');
			var image;
			for (var idx = 0, len = this.images.length; idx < len; idx++) {
				//render image
				image = this.images[idx];
				h.push('<image src="', getImageUrl(image.id), '"alt="', image.name,
						'" class="img-responsive">');
				//TODO render multiple images in a loop
				break;
			}
			h.push('<div class="caption"><h4>', this.name, '</h4></div></div>');
			h.push('<div id="', this.id, '_tileFooter">',
					'<p><a id="', this.id, '_addToItinerary" href="#" class="btn btn-primary">Add</a></p>',
					'</div>');			
			h.push('</div></div>');
		},
		addEvents: function() {
			var me = this;
			$('#' + this.id + '_tileContent').click(function() {
				me.handleClick();
			});
			$('#' + this.id + '_addToItinerary').click(function(event) {
				me.dispatch('action', {
					action: 'addToItinery' 
				});
			});
		},
		handleClick: function() {
			if (this.isDescriptionLoaded()) {
				this.showPopup();
			} else {
				var me = this;
				Client.getDescription(this.mid, function(description) {
					me.setDescription(description);
					me.showPopup();
				});	
			}
		},
		showPopup: function() {
			if (!tileDialog) {
				tileDialog = new Dialog({
					title: this.name,
					content: this.description,
					buttons: dialogButtons,
					addCloseButton: true
				});
			} else {
				tileDialog.setTitle(this.name);
				tileDialog.setContent(this.description);
			}
			tileDialog.addEventListener('click', this, this.handleDialogEvents);
			tileDialog.renderInto(dialogContainer, false);
			dialogContainer.modal('show');
		},
		handleDialogEvents: function(evt) {
			switch (evt.type) {
				case 'click':
					var action = evt.data.action;
					this.dispatch('action', {
						action: action
					});
					tileDialog.removeEventListener('click', this);
					dialogContainer.modal('hide');
					break;
			}
		}
	};
})());
