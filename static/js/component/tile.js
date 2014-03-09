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
			h.push('<div class="small tile" id="', this.id, '">');
			h.push('<div id="', this.id + '_images', '">');
			var image;
			for (var idx = 0, len = this.images.length; idx < len; idx++) {
				//render image
				image = this.images[idx];
				h.push('<image src="', getImageUrl(image.id), '"alt="', image.name,
						'" class="img-responsive">');
				//TODO render multiple images in a loop
				break;
			}
			h.push('</div>');
			h.push('<div class="tile_title">', this.name, '</div>');			
			h.push('</div>');
		},
		addEvents: function() {
			var me = this;
			$('#' + me.id).click(function() {
					me.handleClick();
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
