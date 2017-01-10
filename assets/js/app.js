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

        $(document).on("click", ".add-route", function() {
            var location = {lat: $(this).data("lat"), lng: $(this).data("lng")};

           waypts.push({
            location: location,
            stopover: true
            });

           calculateAndDisplayRoute();

        });

    } // end init

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

    function displayPlacesAroundMarker(marker) {
        $('#city_list').empty();
        markers.forEach(function(m) {

            var geourl = "http://api.geonames.org/findNearbyPlaceNameJSON?radius=50&lat=" + m.position.lat() + "&lng=" + m.position.lng() + "&cities=cities15000&username=tripstop";

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

                getWeather(geoResponse.geonames[0].lat,geoResponse.geonames[0].lng)

                $(".fa-action").on("click", function() {
                    //debugger;
                    $('#place_list').empty();
                    
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
        });
    }

    function getPlacesListFromGoogleAPI(lat, lng, category, city) {
        // can't think of a better way to pass the category to the createMarker function
        globalCat = category;
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

    var marker = new google.maps.Marker({
      map: map,
      icon: icon,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
      // infoWindow will show:
      //    option to Add to Route (or Remove from Route)
      //    Business info
      //       - Buisness Name
      //       - Rating

      console.log(waypts);

      var location = {lat: this.position.lat(), lng: this.position.lng()}
      var wayptCheck = {
            location: location,
            stopover: true
            }

      if (waypts.indexOf(wayptCheck) >= 0) {
        console.log("true")
      } else {
        console.log("false")
      }

      var infodiv = $("<div>").addClass("infowin")
      var name = $("<p>").text(place.name).addClass("place-name")
      var rating = $("<p>").text(place.rating).addClass("place-rating")
      var addRoute = $("<p>").text("Add to Route").addClass("add-route")
            .attr("data-lat", this.position.lat()).attr("data-lng", this.position.lng());

      infodiv.append(name).append(rating).append(addRoute)

     infowindow.setContent(infodiv.html());
      infowindow.open(map, this);
    });
  }

    function getWeather(lat, lng) {
        var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.darksky.net/forecast/21641b7b2b96f7eede5a22906c35deb8/" + lat + "," + lng + "?exclude=flags%2Cminutely%2Chourly",
        "method": "GET",
        "dataType": 'jsonp'
        }
        console.log("get weather" + JSON.stringify(settings))

        $.ajax(settings).done(function (response) {
        
            console.log("weather:  ");
            console.log(response);


            for (i=0; i<response.daily.data.length; i++) {

                weatherdate = response.daily.data[i].time;
                hightemp = response.daily.data[i].temperatureMax;
                lowtemp = response.daily.data[i].temperatureMin;
                weatherforecast = response.daily.data[i].summary;
                $(".table-weather > tbody").append("<tr><td>" + weatherdate + "</td><td>" + hightemp + "</td><td>" + lowtemp + "</td><td>" + weatherforecast + "</td></tr>");
            }
        });
    }  // end of getWeather

    function getPlacesListFromYelpAPI(lat, lng, category) {
    	// Add code for Yelp API here
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
        if (markers.length > 0) {
            displayPlacesAroundMarker(markers);
        }


    }

    google.maps.event.addDomListener(window, 'load', init);




}); // end document ready
