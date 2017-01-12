$(document).ready(function() {

    var markers = [];
    var waypts = [];
    var searchResults = [];
    var origin;
    var destination;
    var map;
    var dirDisp = new google.maps.DirectionsRenderer();
    var dirServ = new google.maps.DirectionsService();
    var globalCat;


    function init() {
        $(".panel-weather").hide();
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
            console.log(destination);
            calculateAndDisplayRoute();
            $("#msgModaltitle").text("Hint")
            $("#modal-message").text("Click on locations along the route to find restaurants, hotels and weather reports.");
            $("#msgModal").modal("show");
        };

        document.getElementById('go-btn').addEventListener('click', onClickGoHandler);

        google.maps.event.addListener(map, 'click', function(event) {
        	deleteMarkers();
            placeMarker(event.latLng);
        });

        $(document).on("click", ".add-route", function() {
            var location = {lat: $(this).data("lat"), lng: $(this).data("lng")};

           waypts.push({
            location: location,
            stopover: true
            });

           //update the waypt: key of the marker to indicate that it is now a waypoint marker
           markers[$(this).data("index")].waypt = true;
           calculateAndDisplayRoute();

        });

        $(document).on("click", ".remove-route", function() {
            removeWayPointsFromRoute($(this));
            calculateAndDisplayRoute();
        });

    } // end init

      function removeWayPointsFromRoute(objWayPt){
        var location = {lat: objWayPt.data("lat"), lng: objWayPt.data("lng")};

           //delete the waypoint element indicated by the saved waypt-index 
           waypts.splice(objWayPt.data("waypt-index"), 1)

           //if we delete a waypoint somewhere in the middle of the waypnts array, 
           //then the following waypoint indexes need to be updated to reflect their current position in the waypnts array
           objWayPt.nextAll().data("waypt-index", $(this).data("waypt-index") - 1) 

           //update the marker to indicate it is no longer a waypoint and remove it from the map
           markers[objWayPt.data("index")].waypt = false;
           markers[objWayPt.data("index")].setMap(null);
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
                populatePlacesTab(response);
            } else {
                $("#msgModaltitle").text("Warning")
                $("#modal-message").text("The route could not be generated.  Please check your starting and ending points.")
                $("#msgModal").modal("show");
            }
        });

    }

     function populatePlacesTab(dsresponse) {
    $('#place_list').empty();
    for (var i = 0; i < dsresponse.geocoded_waypoints.length; i++) {
        var request = {
            placeId: dsresponse.geocoded_waypoints[i].place_id
        };

        service = new google.maps.places.PlacesService(map);
        service.getDetails(request, callback);

        function callback(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                pDiv = $('<div>');
                pDiv.append('<p>').text(place.name)
                pDiv.append('<p>').text(place.formatted_address)
                pDiv.append('<p>').text(place.phone_number)
                pDiv.append('<p>').text(place.website);
                $('#place_list').append(pDiv);
            }
        }
      }        
    }

    function displayPlacesAroundMarker(marker) {
        $('#city_list').empty();
        markers.forEach(function(m) {

        	if (m.type === "nearby") {
	            var geourl = "http://api.geonames.org/findNearbyPlaceNameJSON?radius=50&lat=" + m.position.lat() + "&lng=" + m.position.lng() + "&cities=cities10000&username=tripstop";

	            //console.log(geourl);
	            $.ajax({ url: geourl, method: "GET" }).done(function(geoResponse) {
	                console.log(geoResponse);

	                for (var i = 0; i < geoResponse.geonames.length; i++) {
	                    var nearbyPlace = $("<div>").addClass("nearby-place-div").text(geoResponse.geonames[i].name)
	                    .attr("data-lat", geoResponse.geonames[i].lat).attr("data-lng", geoResponse.geonames[i].lng);
	                    nearbyPlace.append('<span class="fa fa-bed fa-fw fa-action" style="font-size:18px"></span>');
	                    nearbyPlace.append('<span class="fa fa-cutlery fa-fw fa-action" style="font-size:18px"></span>');
	                    nearbyPlace.append('<span class="fa fa-thermometer-full fa-fw fa-action"  style="font-size:18px"></span>');
	                    // nearbyPlace.data("data-lat", geoResponse.geonames[i].lat).data("data-lng", geoResponse.geonames[i].lng);

	                    $('#city_list').append(nearbyPlace);

	                }

	                //This throws an error if no nearby places are found
	                getWeather(geoResponse.geonames[0].lat,geoResponse.geonames[0].lng)

	                $(".fa-action").on("click", function() {
	                    //debugger;
	         
	                    var category = 'wiki';
	                    console.log($(this).data("data-cat"));
	                    var classesList = $(this).attr('class').split(" ");
	                    if(classesList.indexOf('fa-cutlery') >= 0){
	                        category = 'restaurant';

	                    }else if (classesList.indexOf('fa-thermometer-full') >= 0){
	                        category = 'weather';
	                    }else if (classesList.indexOf('fa-bed') >= 0){
	                        category = 'lodging';
	                    }
	                    console.log(category);
	                    var lat = $(this).parent().data("lat");
	                    var lng = $(this).parent().data("lng");
	                    var city = $(this).parent().text();
	                    //var addPlaceInfo = getPlacesListFromGoogleAPI($(this).data("data-lat"), $(this).data("data-lng"), category);
	                    // var addPlaceInfo = getPlacesListFromGoogleAPI(lat, lng, category, city);
	                    getPlacesListFromGoogleAPI(lat, lng, category, city);
	                    // $('#place_list').append(addPlaceInfo);


	                });
	            });
	        } // end if marker type = nearby
        });
    }

    function getPlacesListFromGoogleAPI(lat, lng, category, city) {
        // can't think of a better way to pass the category to the createMarker function
        globalCat = category;
        if (category == 'weather'){
            console.log("getting weather forecast");
            getWeather(lat, lng, category,city);
        } 
        else {
            console.log(lat + ","+  lng + "," +  category+ ", " +city);
            var plc = $("<div class='catNames'>");
            plc.append("<h4>"+ " Find "+  category + "  in " + city + "</h4>");
            var loc = new google.maps.LatLng(lat, lng);
            // var loc = {lat: lat, lng: lng};

            infowindow = new google.maps.InfoWindow();
            var service = new google.maps.places.PlacesService(map);
            service.nearbySearch({
                location: loc,
                radius: 5000,
                type: [category]
            }, callback);

        }
        // for (var i = 0; i < searchResults.length; i++) {
        //     var catName = $("<div>");
        //     catName.append(searchResults[i].name);
        //     plc.append(catName);
        //     //console.log(catName);
        // }
        // searchResults = [];
        // return plc;
    }

    function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          var place = results[i];
          createMarker(place);
        }
      }
    }

    function createMarker(place) {
    var placeLoc = place.geometry.location;
    var icon;

    switch (globalCat) {

        case 'lodging':
            icon = 'assets/images/ic_hotel_24px.svg'
            break;
        case 'restaurant':
            icon = 'assets/images/ic_restaurant_24px.svg'
            break;
        case 'weather':
            icon = 'assets/images/ic_wb_cloudy_24px.svg'
            break;
    }

    //waypt: key will be used to identify a marker as a waypoint
    //markeri: key will be used to identify where in the array of markers this element will reside after it is pushed
    //type: key is used identify it is a place parker and not a location marker when we show nearby cities
    var marker = new google.maps.Marker({
      map: map,
      icon: icon,
      waypt: false,
      markeri: markers.length,
      type: "place",
      position: place.geometry.location,
      animation: google.maps.Animation.DROP
    });

    markers.push(marker);

    google.maps.event.addListener(marker, 'click', function() {
      // infoWindow will show:
      //    option to Add to Route (or Remove from Route)
      //    Business info
      //       - Buisness Name
      //       - Rating (if exists)

      var wayptExists = false;
      var index;
      var location = {lat: this.position.lat(), lng: this.position.lng()};

      // Check to see if the marker that was clicked is an existing waypoint
      // if it is, take note of the waypoint index so we can track this in our DOM element for waypoint management purposes
      for (var i = 0; i < waypts.length; i++) {
          if (waypts[i].location.lat === location.lat && waypts[i].location.lng === location.lng) {
            wayptExists = true;
            index = i;
            break;
          };
      };

      //create infowindow DOM element
      var infodiv = $("<div>").addClass("infowin");
      var name = $("<p>").text(place.name).addClass("place-name");

      var rating;

      if (place.rating == null) {
      	rating = $("<p>").text("No Rating Available").addClass("place-rating");
      } else {
      	rating = $("<p>").text("Rating: " + place.rating + " of 5").addClass("place-rating");
      }

      var toggleRoute;

      //check to see if this marker, as determined above, is an existing waypoint. 
      //if it is, then store the index of the waypoint in the DOM element so we know which waypoint to remove if the user chooses to do so
      //also, we store the index of the marker itself so we know which marker to delete or not delete (if it's a waypoint) when we refresh the map
      if (wayptExists) {
      		toggleRoute = $("<p>").text("Remove from Route").addClass("remove-route")
            .attr("data-lat", this.position.lat()).attr("data-lng", this.position.lng())
            .attr("data-waypt-index", index).attr("data-index", this.markeri);
      } else {
      	    toggleRoute = $("<p>").text("Add to Route").addClass("add-route")
            .attr("data-lat", this.position.lat()).attr("data-lng", this.position.lng())
            .attr("data-index", this.markeri);
      }

      infodiv.append(name).append(rating).append(toggleRoute);

      infowindow.setContent(infodiv.html());
      infowindow.open(map, this);
    });
  }

 

    function getWeather(lat, lng, category,city) {
        var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.darksky.net/forecast/21641b7b2b96f7eede5a22906c35deb8/" + lat + "," + lng + "?exclude=flags%2Cminutely%2Chourly",
        "method": "GET",
        "dataType": 'jsonp'
        }
        console.log("get weather" + JSON.stringify(settings))

        $.ajax(settings).done(function (response) {
        
            console.log("weather:  " + category + ", " + city);
            console.log(response);

            if (category == "destination") {
                for (i=0; i<response.daily.data.length; i++) {
                    weatherdate =  weatherdate = moment().add(i, "d").format("MM/DD");
                    hightemp = response.daily.data[i].temperatureMax;
                    lowtemp = response.daily.data[i].temperatureMin;
                    weatherforecast = response.daily.data[i].summary;
                    $(".table-weather > tbody").append("<tr><td>" + weatherdate + "</td><td>" + hightemp + "</td><td>" + lowtemp + "</td><td>" + weatherforecast + "</td></tr>");
                }
                $(".panel-weather").show()
            } else {
                for (i=0; i<response.daily.data.length; i++) {
                    weatherdate =  weatherdate = moment().add(i, "d").format("MM/DD");
                    hightemp = response.daily.data[i].temperatureMax;
                    lowtemp = response.daily.data[i].temperatureMin;
                    weatherforecast = response.daily.data[i].summary;
                    $(".table-weather-modal > tbody").append("<tr><td>" + weatherdate + "</td><td>" + hightemp + "</td><td>" + lowtemp + "</td><td>" + weatherforecast + "</td></tr>");
                }
                 $("#weatherModal").modal("show");// put weather in a modal box
            }
        });
    }  // end of getWeather

    function getPlacesListFromYelpAPI(lat, lng, category) {
    	// Add code for Yelp API here
    }

    function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map,
            type: "nearby",
            animation: google.maps.Animation.DROP
        });
        markers.push(marker);

        calculateAndDisplayRoute();
        if (markers.length > 0) {
            displayPlacesAroundMarker(markers);
        }


    }

	// Sets the map on all markers in the array.
	function setMapOnAll(map) {
		for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
		}
	}

	// Removes the markers from the map, but keeps them in the array.
	function clearMarkers() {
		setMapOnAll(null);
	}

	// Shows any markers currently in the array.
	function showMarkers() {
		setMapOnAll(map);
	}

	// Deletes all markers in the array by removing references to them.
	function deleteMarkers() {
		//make a copy of the current markers so that after we remove all of them, we can add back the waypoint markers
		var markersHold = markers;
		clearMarkers();
		markers = [];

		//if a marker is a waypoint, leave it on the map so the user has a way to remove from the route
		for (var i = 0; i < markersHold.length; i++) {
			if (markersHold[i].waypt) {
				//reset the index hold area of the marker since only waypoint markers are kept
				markersHold[i].markeri = markers.length
				markers.push(markersHold[i])
			}
		}
		showMarkers();
	}

    google.maps.event.addDomListener(window, 'load', init);




}); // end document ready
