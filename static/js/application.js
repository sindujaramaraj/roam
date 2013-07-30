//some init stuffs on page load
$(document).ready(function() {
	Application.init();
});

function search() {
	Application.search();
}

var Application = (function() {
	//leaflet map object
	var map;
	var itinery = [];
	var locationItems = {};
	
	//html
	var itineryElem = $("#itinery");
	var path = null;
	
	return  {
		init : function() {
			map = L.map('map');

			L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
				maxZoom: 18,
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="http://cloudmade.com">CloudMade</a>'
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
		},
		search : function() {
			var searchText = $("#searchText")[0].value;
			$.ajax({
				type : "get",
				url : "/getVenues",
				data : "searchText=" + searchText + "&cat=food",
				success : function(response) {
					response = Util.stringToJSON(response);
					
					function processResponse(res) {
						var groups = res.response.groups;
						var items, location, marker;
						for (var gIdx = 0, gLen = groups.length; gIdx < gLen; gIdx++) {
							items = groups[gIdx].items;
							for (var idx = 0, len = items.length; idx < len; idx++) {
								location = items[idx].location;
								if (idx == 0) {
									map.setView([location.lat, location.lng], 20);
								}
								marker = L.marker([location.lat, location.lng]).addTo(map);
								locationItems[items[idx].id] = {
										latlng : new L.LatLng(location.lat, location.lng),
										name : items[idx].name
								};
								marker.bindPopup("<b>" + items[idx].name + "</b>" 
										+ "<div><div class='btn-group'>"
										+ "<button id='" + items[idx].id + "'onclick='Application.addToPlan(event)' class='btn btn-primary btn-small'>Add to my plan</button>"
										+ "</div></div>").openPopup();
							}
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
				itineryElem.append("<div class='distance'>" + distance + "</div>");
			}
			//add location item to itinery
			itineryElem.append("<div class='itinery-item'>" + locationItem.name + "</div>");
			itinery.push(locationItem);
			path.addLatLng(locationItem.latlng);
			map.fitBounds(path.getBounds());			
		},
		findDistance : function(fromLatLng, toLatLng) {
			
		}
	};
})();