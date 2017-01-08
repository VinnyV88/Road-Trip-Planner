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
		origin = startInput.value
		destination = endInput.value
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

function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location, 
        map: map
    });
    markers.push(marker);
    waypts.push({
    	location: location,
    	stopover: true
    });

	calculateAndDisplayRoute();

}

google.maps.event.addDomListener(window, 'load', init);




}); // end document ready