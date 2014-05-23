//some init stuffs on page load
$(document).ready(function() {
	$.fn.switchClass = function(oldClass, newClass) {
		if (this.hasClass(oldClass)) {
			this.removeClass(oldClass);
		}
		this.addClass(newClass);
	};
	$('#loginLink').click(function() {
		Application.showLoginDialog();
	});
	$('#showMapViewLink').click(function() {
		Application.showMapView();
	});
	$('#showTileViewLink').click(function() {
		Application.showTileView();
	});
	$('#myItineraryLink').click(function() {
		Application.getMyItineraries();
	});
	$('#deleteAllItineraryLink').click(function() {
		Client.clearAllItineraries();
	});
	Application.init();
});

function search() {
	Application.search(0);
}

function searchByType(type) {
	Application.clearMap();
	Application.search(0, type);
}

var Application = (function() {
	//leaflet map object
	var map = null;
	var itinerary = null;
	var locationItems = {};
	var limit = 30;
	var layers = [];
	var tiles = [];
	var places = {};
	var markers = [];
	var loginDialog = null;
	var itineraryDialog = null;
	
	//html
	var path = null;
	
	function getPlaceType(types) {
		for (var idx = 0, len = types.length; idx < len; idx++) {
			if (types[idx] == 'country' || types[idx] == 'locality') {
				return types[idx];
			} else if (types[idx] == 'administrative_area_level_1') {
				return 'state';
			} else if (types[idx] == 'administrative_area_level_2') {
				return 'district';
			}
			//TODO check for other types
		}
	}
	
	return  {
		init : function() {
			this.checkLogin();
			//load map view or tile view by preference
			//for now let it be map view
			this.loadGoogleMap();
			this.showMapView();
			
			var autocomplete = new google.maps.places.Autocomplete($('#searchPlace')[0]);
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
				Application.clearMarkersAndTile();
				var place = autocomplete.getPlace();
				if (!place.geometry) {
					return;
				}
				//get place details
				if (place.geometry.viewport) {
					map.fitBounds(place.geometry.viewport);
				} else {
					map.setCenter(place.geometry.location);
				}
				
				Application.getPlaceDetails(place);
				
				//$('#planning').show();
				
				//Application.search(place.name);
				//show itinerary
				if (itinerary == null) {
					itinerary = new Itinerary();
					itinerary.renderInto($("#itinerary"));
				}
				itinerary.addDestination(place.name);
			});	
			this.setHeight();
		},		
		getMyItineraries: function() {
			Client.getMyItineraries(function(response) {
				if (response.status == 'failure') {
					alert(response.message);
				} else {
					Application.showMyItineraries(response.itineraries);	
				}
			});
		},
		showMyItineraries: function(itineraries) {
			var itineraryHtml = ['<div class="row">'];
			var itinerary;
			var itineraryTiles = [];
			for (var idx = 0, len = itineraries.length; idx < len; idx++) {
				itinerary = new Itinerary(itineraries[idx]);
				itinerary.addEventListener('action', this, this.handleItinerarySelected);
				itinerary.renderAsTile(itineraryHtml);
				itineraryTiles.push(itinerary);
			}
			itineraryHtml.push('</div>');
			if (!itineraryDialog) {
				itineraryDialog = new Dialog({
					title: 'My Itineraries',
					content: itineraryHtml.join(''),
					buttons: []
				});
			} else {
				itineraryDialog.setContent(itineraryHtml.join(''));
			}
			itineraryDialog.renderInto($('#dialogContainer'), false);
			for (var idx = 0, len = itineraryTiles.length; idx < len; idx++) {
				itineraryTiles[idx].addTileEvents();
			}
			$('#dialogContainer').modal('show');
		},
		handleItinerarySelected: function(evt) {
			itinerary = evt.eventSource;
			//clear map
			this.clearMarkersAndTile();
			itinerary.renderInto($("#itinerary"));
			//load destination map and tile
			//clear and load itinerary on left
			$('#dialogContainer').modal('hide');
		},
		setHeight: function () {
			var totalHeight = $('body')[0].offsetHeight;
			var headerHeight = $('#header')[0].offsetHeight;
			var contentHeight = (totalHeight - headerHeight);
			$('#content')[0].style.height = contentHeight + 'px';
			$('#map')[0].style.height = (contentHeight - $('#search')[0].offsetHeight
														- $('#tabView')[0].offsetHeight) + 'px';
		},
		getPlaceDetails: function (place) {
			var type = getPlaceType(place.types);
			switch(type) {
				case 'country':
				case 'state':
					//get details for the country from freebase
					this.getPlacesForCountry(place.name);
					break;
				case 'locality':
					this.getPlacesForLocality(place.name);
				default:
					//TODO
			}
		},
		getPlacesForCountry: function(country) {
			Client.getPlacesForCountry(country, function(locations) {
				Application.handleLocations(locations);
			});
		},
		getPlacesForLocality: function(locality) {
			Client.getPlacesForLocality(locality, function(locations) {
				Application.handleLocations(locations);
			});
		},
		handleLocations: function(locations) {
			for (var idx = 0, len = locations.length; idx < len; idx++) {
				places[locations[idx].mid] = locations[idx];
				Application.createMarker(locations[idx]);
				Application.createTile(locations[idx]);
			}
		},
		createMarker: function(place) {
			var marker = new google.maps.Marker({
				map: map
			});
			markers.push(marker);
			var latlng = place['/location/location/geolocation'];
			if (latlng != null) {
				var gLatLng = new google.maps.LatLng(latlng.latitude, latlng.longitude);
				marker.setPosition(gLatLng);
				var placeId = place.id;
				google.maps.event.addListener(marker, 'click', function() {
					if (place.tile.isDescriptionLoaded()) {
						place.tile.showPopup();
					} else {
						Client.getDescription(placeId, function(description) {
							place.tile.setDescription(description);
							place.tile.showPopup();
						});	
					}
				});	
			}
		},
		loadGoogleMap: function(place) {
			if (map == null) {
				 var mapOptions = {
						    center: new google.maps.LatLng(-33.8688, 151.2195),
						    zoom: 13
						  };
				 map = new google.maps.Map(document.getElementById('map'), mapOptions);				
			}
		},
		clearMarkers: function() {
			for (var idx = 0, len = markers.length; idx < len; idx++) {
				markers[idx].setMap(null);
			}
			markers = [];
		},
		showMapView: function() {
			$('#map').show();
			$('#tile').hide();
		},
		showTileView: function() {
			$('#map').hide();
			$('#tile').show();
		},
		clearTiles: function() {
			delete tiles;
			tiles = [];
			$('#tile').empty();
		},
		createTile: function(location) {
			var config = {
					mid: location.mid,
					name: location.name,
					images: location['/common/topic/image']
			};
			var tile = new Tile(config);
			tile.addEventListener('action', this, this.handleTile);
			tiles.push(tile);
			location.tile = tile;
			//GHM should render all tile at once or render one by one?
			tile.renderInto($('#tile'), true);
		},
		handleTile: function(event) {
			var eventSource = event.eventSource;
			switch (event.type) {
				case 'action':
					if (event.data.action == 'addToItinery') {
						this.addToItinerary(places[eventSource.getMid()]);
					}
			}
		},
		addToItinerary: function(location) {
			itinerary.addItem(new ItineraryItem({
				name: location.name,
				mid: location.mid,
				geoloc: location['/location/location/geometry']
			}));
		},
		loadTiles: function(places) {
			this.clearTiles();
			for (var idx = 0, len = places.length; idx < len; idx++) {
				this.createTile(places[idx]);
			}
		},
		clearMarkersAndTile: function() {
			this.clearTiles();
			this.clearMap();
		},
		search : function (place, offset, type) {
			var paramJson = {near: place, offset : offset, limit : limit};
			type && (paramJson.section = type);
			$.ajax({
				type : "get",
				url : "/getVenues" + L.Util.getParamString(paramJson),
				success : function(response) {
					response = Util.stringToJSON(response);
					
					function processResponse(res) {
						var groups = res.response.groups;
						var items, location, marker, venue;
						var markerArr = [];
						for (var gIdx = 0, gLen = groups.length; gIdx < gLen; gIdx++) {
							items = groups[gIdx].items;
							for (var idx = 0, len = items.length; idx < len; idx++) {
								venue = items[idx].venue;
								if (idx == 0) {
									map.setView([venue.location.lat, venue.location.lng], 100);
								}
								marker = L.marker([venue.location.lat, venue.location.lng]);
								locationItems[venue.id] = {
										latlng : new L.LatLng(venue.location.lat, venue.location.lng),
										name : venue.name
								};
								marker.bindPopup("<b>" + venue.name + "</b>" 
										+ "<div><div class='btn-group'>"
										+ "<button id='" + venue.id + "'onclick='Application.addToPlan(event)' class='btn btn-primary btn-small'>Add to my plan</button>"
										+ "</div></div>").openPopup();
								markerArr.push(marker);
							}
						}
						layers.push(L.layerGroup(markerArr).addTo(map));
						if (offset*limit < res.response.totalResults) {
							Application.search(++offset, type);
						}
					}
					
					processResponse(response);					
				},
				failure : function(response) {
					alert("failure");
				}
			});
		},
		addToPlan : function (event) {
						
		},
		findDistance : function (fromLatLng, toLatLng) {
			
		},
		clearMap : function () {
			
		},
		checkLogin: function() {
			Client.isUserLoggedIn(function(response) {
				if (response.status) {
					$('#loginLink').hide();
					//show user info
				} else {
					$('#myItineraryLink').hide();
				}
			});
		},
		showLoginDialog: function() {
			if (loginDialog == null) {
				loginDialog = new Dialog({
					title: 'Signup',
					content: this._getLoginHtml(),
					buttons: [] || [{
						label: 'Join',
						action: 'signup',
						type: 'primary',
						isSubmit: 'true'
					}]
				});
				loginDialog.renderInto($('#dialogContainer'));
				//hide login button
				$('#signinBtn').hide();
				$('#signupPrompt').hide();
				
				$('#loginForm').ajaxForm({
					success: function(response) {
						if (response.status == 'success') {
							$('#loginLink').hide();
							$('#dialogContainer').modal('hide');
							//TODO show user information
						} else {
							$('#dialogMessage').replaceWith('<p class="bg-warning">' + response.message + '</p>');
						}
					}
				});
				
				$('#loginForm').submit(function() {
					$(this).ajaxSubmit();
					return false;
				});
				
				function formSubmit() {
					$('#loginForm')[0].submit();
				}
				
				//handle sign up
				$('#signupBtn').click(function() {
					$('#loginForm').attr('action', '/signup');
					formSubmit();
				});
				//handle signin
				$('#signinBtn').click(function() {
					$('#loginForm').attr('action', '/login');
					formSubmit();
				});
				
				//switch login
				$('#loginPromptLink').click(function() {
					$('#username').hide();
					$('#loginPrompt').hide();
					$('#signupPrompt').show();
					$('#signupBtn').hide();
					$('#signinBtn').show();
					loginDialog.setTitle('Login');
				});
				$('#signupPromptLink').click(function() {
					$('#username').show();
					$('#loginPrompt').show();
					$('#signupPrompt').hide();
					$('#signupBtn').show();
					$('#signinBtn').hide();
					loginDialog.setTitle('Join');
				});
			}
			$('#dialogContainer').modal('show');
		},
		_getLoginHtml: function() {
			return '<div><div id="dialogMessage"></div>'
					+ '<form id="loginForm" method="post" role="form" target="postTargetFrame">'
						+ '<div class="form-group"><input name="username" id="username" type="text" class="form-control" placeholder="User Name"/></div>'
			 			+ '<div class="form-group"><input name="email" id="email" type="email" class="form-control" placeholder="Email Address"/></div>'
			 			+ '<div class="form-group"><input name="password" id="password" type="password" class="form-control" placeholder="Password"/></div>'
			 			+ '<button type="submit" id="signupBtn" class="center-block btn btn-primary">Join</button>'
			 			+ '<button type="submit" id="signinBtn" class="center-block btn btn-primary">Login</button>'
			 		+ '</form>'
			 		+ '<div id="loginPrompt"><span>Have an account?</span>&nbsp;&nbsp;'
			 		+ '<a href="#" id="loginPromptLink">Login</a></div>'
			 		+ '<div id="signupPrompt"><span>Don\'t have an account?</span>&nbsp;&nbsp;'
			 		+ '<a href="#" id="signupPromptLink">Signup</a></div>'
			 		+ '</div>';
		},
		handleLoginActions: function(event) {
			
		},
	};
})();