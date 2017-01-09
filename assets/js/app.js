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
		origin = "Danbury, CT, United States";//startInput.value;
		destination = "Chicago, IL, United States";//endInput.value;
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
        	var nearbyPlace = $("<div>").addClass("nearby-place-div").text(geoResponse.geonames[i].name);
        	nearbyPlace.append('<span class="fa fa-bed fa-fw" style="font-size:12px"></span>');
        	nearbyPlace.append('<span class="fa fa-cutlery fa-fw" style="font-size:12px"></span>');
        	nearbyPlace.append('<span class="fa fa-camera fa-fw" style="font-size:12px"></span>');
        	nearbyPlace.data("data-lat", geoResponse.geonames[i].lat).data("data-lng", geoResponse.geonames[i].lng);
        	$('#city_list').append(nearbyPlace);

        }
        $(".nearby-place-div").on("click", function() {
		console.log($(this).data("data-lng"));
		console.log($(this).data("data-lat"));
		console.log($(this));
		var addPlaceInfo = getPlacesList($(this).data("data-lat"),$(this).data("data-lng"));
		
		$(this).append(addPlaceInfo);
      	});
      });
	});
}

function getPlacesList(lat, lng){
		var placeurl = "https://maps.googleapis.com/maps/api/place/nearbysearch/output?location="
				+ lat +"," + lng + "&type=restaurant&key=AIzaSyChdzpVUSJi4iCSuBYCHaPUVYzadGWSbCI";
				var plc = $("<div>");
				plc.text("Add Div");
				var loc = new google.maps.LatLng(lat, lng);
				infowindow = new google.maps.InfoWindow();

		        var service = new google.maps.places.PlacesService(map);
		        service.nearbySearch({
		          location: loc,
		          radius: 500,
		          type: ['restaurant']
		        }, callback);

		/*placeurl = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Sydney&key=AIzaSyAn7Mw8AH7zQYoFhVreQdQxfn9KYuwD_JA";
		console.log(placeurl);
		//placeurl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.2453741,-75.6496302&type=restaurant&key=AIzaSyChdzpVUSJi4iCSuBYCHaPUVYzadGWSbCI";
		 $.ajax({ 
		 	url: placeurl, 
		 	type: "GET",
  			dataType: 'json',
  			crossOrigin: true,
  			'Access-Control-Allow-Origin' : '*'
		 }).done(function(placeResponse) {
        console.log(placeResponse);
        //console.log(response.Runtime);
      });*/
		 return plc;
}

function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            //createMarker(results[i]);
            console.log(results[i]);
          }
        }
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