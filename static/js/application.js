//some init stuffs on page load
$(document).ready(function() {
	//$('#planning').hide();
	$('#showMapViewLink').click(function() {
		Application.showMapView();
	});
	$('#showTileViewLink').click(function() {
		Application.showTileView();
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
			//load map view or tile view by preference
			//for now let it be map view
			this.loadGoogleMap();
			this.showMapView();
			
			var autocomplete = new google.maps.places.Autocomplete($('#searchPlace')[0]);
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
				var place = autocomplete.getPlace();
				if (!place.geometry) {
					return;
				}
				//get place details
				if (place.geometry.viewport) {
					map.fitBounds(place.geometry.viewport);
				} else {
					map.setCenter(place.geometry.location);
					map.setZoom(17);
				}
				
				Application.getPlaceDetails(place);
				
				//$('#planning').show();
				
				//Application.search(place.name);
				//show itinerary
				if (itinerary == null) {
					itinerary = new Itinerary();
					itinerary.renderInto($("#itinerary"));
					itinerary.addEventListener('click', this, this.handleItineraryAction);
				}
			});	
			this.setHeight();
		},
		handleItineraryAction: function(event) {
			switch (event.data.action) {
				case 'save':
					break;
				case 'reset':
					break;
			}
		},
		setHeight: function () {
			var totalHeight = $('body')[0].offsetHeight;
			var searchForPlacesHeight = $('#searchForPlaces')[0].offsetHeight;
			var planningHeight = (totalHeight - searchForPlacesHeight);
			$('#planning')[0].style.height = planningHeight + 'px';
			$('#map')[0].style.height = (planningHeight - $('#search')[0].offsetHeight) + 'px';
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
			var latlng = place['/location/location/geolocation'];
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
			
		}
	};
})();