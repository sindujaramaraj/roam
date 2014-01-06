//some init stuffs on page load
$(document).ready(function() {
	$('#planning').hide();
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
	var map;
	var mapLoaded = false;
	var itinery = [];
	var locationItems = {};
	var limit = 30;
	var layers = [];
	
	//html
	var itineryElem = $("#itinery");
	var path = null;
	
	return  {
		init : function() {
			var autocomplete = new google.maps.places.Autocomplete($('#searchPlace')[0]);
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
				var place = autocomplete.getPlace();
				if (!place.geometry) {
					return;
				}
				$('#planning').show();
				Application.loadMap();
				Application.search(place.name);
			});	
			this.setHeight();
		},
		setHeight: function() {
			var totalHeight = $('body')[0].offsetHeight;
			var searchForPlacesHeight = $('#searchForPlaces')[0].offsetHeight;
			var planningHeight = (totalHeight - searchForPlacesHeight);
			$('#planning')[0].style.height = planningHeight + 'px';
			$('#map')[0].style.height = (planningHeight - $('#search')[0].offsetHeight) + 'px';
		},
		loadMap: function() {
			if (!mapLoaded) {
				map = L.map('map').setView([51.505, -0.09], 13);

				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
					maxZoom: 18,
					attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(map);
				
				function onLocationFound(e) {
					var radius = e.accuracy / 2;

					L.marker(e.latlng).addTo(map)
						.bindPopup("You are within " + radius + " meters from this point").openPopup();

					L.circle(e.latlng, radius).addTo(map);
				}

				function onLocationError(e) {
					alert(e.message);
				}

				map.on('locationfound', onLocationFound);
				map.on('locationerror', onLocationError);

				map.locate({setView: true, maxZoom: 16});
				path = new L.Polyline([], {color : "red"}).addTo(map);
				mapLoaded = true;
			} else {
				this.clearMap();
			}
		},
		search : function(place, offset, type) {
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
		addToPlan : function(event) {
			var locationItem = locationItems[event.target.id];
			if (!locationItem) {
				return;
			}
			
			//find distance with previous location in itinery			
			if (itinery.length > 0) {
				var distance = itinery[itinery.length - 1].latlng.distanceTo(locationItem.latlng);
				itineryElem.append("<div class='distance'><span class='text-muted'>" + distance + "</span></div>");
			}
			//add location item to itinery
			itineryElem.append("<div class='itinery-item'><span class='text-info'>" + locationItem.name + "</span></div>");
			itinery.push(locationItem);
			path.addLatLng(locationItem.latlng);
			path.bringToFront();
			map.fitBounds(path.getBounds());			
		},
		findDistance : function(fromLatLng, toLatLng) {
			
		},
		clearMap : function() {
			for (var idx = 0, len = layers.length; idx < len; idx++) {
				layers[idx].clearLayers();
			}
			map.removeLayer(path);
			layers = [];
			itinery = [];
			locationItems = {};
			path = new L.Polyline([], {color : "red"}).addTo(map);
		}
	};
})();