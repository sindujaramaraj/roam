var Client = {
		getDescription: function(mid, callback) {
			$.getJSON('/getDescription?id=' + mid, function(response) {
				var values = response['property']['/common/topic/description']['values'];
				if (values.length) {
					callback(values[0].value);
				}					
			});
		},
		getPlacesForCountry: function(country, callback) {
			$.getJSON('/getPlacesForCountry?country=' + country, function(response) {
				if (response.result) {
					response = response.result;
				} else {
					//do nothing
					return;
				}
				if (response.length > 1) {
					alert("Found more than one matching country..");
				} else if (response.length == 0) {
					//TODO enhance this alert
					alert("No matching country found!!");
				} else {
					response = response[0];
					var locations = response['/location/location/contains'];
					callback(locations);
				}
			});
		},
		getPlacesForLocality: function(locality, callback) {
			$.getJSON('/getPlacesForLocality?locality=' + locality, function(response) {
				if (response.result) {
					response = response.result;
				} else {
					//do nothing
					return;
				}
				if (response.length > 1) {
					alert("Found more than one matching locality..");
				} else if (response.length == 0) {
					//TODO enhance this alert
					alert("No matching locality found!!");
				} else {
					response = response[0];
					var locations = response['/travel/travel_destination/tourist_attractions'];
					callback(locations);
				}
			});
		},
		saveItinerary: function(itinerary, callback) {
			$.post('/saveItinerary', {
				itinerary: itinerary
			}, function(response) {			
				callback(response);
			}, 'json');
		}
};