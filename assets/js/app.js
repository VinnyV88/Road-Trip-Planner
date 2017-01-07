$(document).ready(function() {


function init() {
	var startInput = document.getElementById('start-location-input');
	var endInput = document.getElementById('destination-location-input');
	var autocompleteStart = new google.maps.places.Autocomplete(startInput);
	var autocompleteEnd = new google.maps.places.Autocomplete(endInput);
	var map = new google.maps.Map(document.getElementById('gmap'), {
            center: new google.maps.LatLng(40.450886, -74.338184),
            zoom: 7
        });

	var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    directionsDisplay.setMap(map);

	var onClickGoHandler = function() {
      calculateAndDisplayRoute(directionsDisplay, directionsService, startInput.value, endInput.value);
    };

    document.getElementById('go-btn').addEventListener('click', onClickGoHandler);
	
	google.maps.event.addListener(map, 'click', function(event) {
	   placeMarker(event.latLng);
	});
}

function calculateAndDisplayRoute(dirDisp, dirServ, origin, destination) {

// var src = "https://www.google.com/maps/embed/v1/directions?key=AIzaSyC2I_GH0H5uaEaTXJIqKI_ioClHYh2ivEE"
// 	+ "&origin=" + origin + "&destination=" + destination;

// $("#gmap").attr("src", src);

	dirServ.route({
	  origin: origin,
	  destination: destination,
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
}

google.maps.event.addDomListener(window, 'load', init);




}); // end document ready