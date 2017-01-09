$(document).ready(function() {

var markers = [];
var waypts = [];
var origin;
var destination;
var map;
var dirDisp = new google.maps.DirectionsRenderer();
var dirServ = new google.maps.DirectionsService();


function init() {
	var startInput = document.getElementById('start-location-input');
	var endInput = document.getElementById('destination-location-input');
	var autocompleteStart = new google.maps.places.Autocomplete(startInput);
	var autocompleteEnd = new google.maps.places.Autocomplete(endInput);
	
	map = new google.maps.Map(document.getElementById('gmap'), {
            center: new google.maps.LatLng(40.450886, -74.338184),
            zoom: 7
        });

    dirDisp.setMap(map);
    dirDisp.setPanel(document.getElementById('gdir'));
    

	var onClickGoHandler = function() {
		origin = startInput.value;
		destination = endInput.value;
      	calculateAndDisplayRoute();
    };
    
    document.getElementById('go-btn').addEventListener('click', onClickGoHandler);
	
	google.maps.event.addListener(map, 'click', function(event) {
	   placeMarker(event.latLng);
	});
}

function calculateAndDisplayRoute() {

	dirServ.route({
	  origin: origin,
	  destination: destination,
	  waypoints: waypts,
      optimizeWaypoints: true,
      provideRouteAlternatives: true,	
	  travelMode: 'DRIVING'
	}, function(response, status) {
	  if (status === 'OK') {
	    dirDisp.setDirections(response);
	  } else {
	    window.alert('Directions request failed due to ' + status);
	  }
	});

}

function displayPlacesAroundMarker(marker){
	$('#city_list').empty();
	markers.forEach(function(m) {
  
		var geourl = "http://api.geonames.org/findNearbyPlaceNameJSON?radius=50&lat="
				+ m.position.lat() +"&lng=" + m.position.lng() + "&cities=cities15000&username=tripstop";

		//console.log(geourl);
		 $.ajax({ url: geourl, method: "GET" }).done(function(geoResponse) {
        console.log(geoResponse);

        for (var i = 0; i < geoResponse.geonames.length ; i++){
        	var nearbyPlace = $("<div>").text(geoResponse.geonames[i].name);
        	$('#city_list').append(nearbyPlace);
        }
        //console.log(response.Runtime);
      });
	});

	// var yelpurl = "https://api.yelp.com/v3/businesses/search?term=delis&latitude=37.786882&longitude=-122.399972";
	// // var yelphdr = "\"Authorization\": \"Bearer qDWKq7x9-7hzkvuUy9cD5VMcQzcUvJCQMvg0OJb7cA7GFEz01af-h_s3Ewhh0LeAFsT6ExfRy0ppYSCWMoHfFY4zth1l_JrrKH-_dcz2Rtuk4wh_2kTS6a04Q8ByWHYx\""

	// $.ajax({ url: yelpurl, 
	// 		  method: "GET",
	// 		  headers: {"Authorization": "Bearer qDWKq7x9-7hzkvuUy9cD5VMcQzcUvJCQMvg0OJb7cA7GFEz01af-h_s3Ewhh0LeAFsT6ExfRy0ppYSCWMoHfFY4zth1l_JrrKH-_dcz2Rtuk4wh_2kTS6a04Q8ByWHYx"},
	// 		  Cache-Control: no-cache
	// 		}).done(function(yelpResponse) {
	// 		console.log(yelpResponse);
	// 	});
	
var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.yelp.com/v3/businesses/search?term=delis&latitude=37.786882&longitude=-122.399972",
  "method": "GET",
  "headers": {
    "authorization": "Bearer qDWKq7x9-7hzkvuUy9cD5VMcQzcUvJCQMvg0OJb7cA7GFEz01af-h_s3Ewhh0LeAFsT6ExfRy0ppYSCWMoHfFY4zth1l_JrrKH-_dcz2Rtuk4wh_2kTS6a04Q8ByWHYx",
    "cache-control": "no-cache"
  }
}

$.ajax(settings).done(function (response) {
  console.log(response);
});
	

}

function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location, 
        map: map
    });
    markers.push(marker);
    /*waypts.push({
    	location: location,
    	stopover: true
    });*/

	calculateAndDisplayRoute();
	if(markers.length > 0){
		displayPlacesAroundMarker(markers);
	}
	

}

google.maps.event.addDomListener(window, 'load', init);




}); // end document ready