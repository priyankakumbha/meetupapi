$(document).ready( function() {
	function initialize() {
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
        zoom: 8,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("maparea"),
            myOptions);
}
google.maps.event.addDomListener(window, "load", initialize);

	// Append countries list (from JSON) to the input datalist
var countryList = {};
var countryCode;

for (var i=0; i < countriesJSON.length; i++) {
    countryList += "<option value='" + countriesJSON[i].code+ "' label='"+ countriesJSON[i].name + "'></option>";
}
 $("#countryList").html(countryList);

	$('.meetupForm').submit( function(event){
		// zero out results if previous search has run
		$(".results" ).empty();
		$('.maparea').html('');
		// get the value of the tags the user submitted
		var topic = $(this).find("input[name='topic']").val();
		var city = $(this).find("input[name='city']").val();
		var country = $(this).find("input[name='country']").val();
		getmeetupEvents(topic,city,country);
	
	});
	
});
// this function takes the event object returned by Meetup
// and creates new result to be appended to DOM
var showEvent = function(resultevent) {
	
	// clone our result template code
	var result = $('.templates .meetupevents').clone();
	
	// Set the question properties in result
	var descriptionElem = result.find('.Event-description');
	
	descriptionElem.html(resultevent.description);

	// set the date asked property in result
	var eventurlElem = result.find('.Eventurl a');
	
	eventurlElem.attr('href', resultevent.event_url );
	eventurlElem.text(resultevent.name)
	var timeElem=result.find('.time')
	var time = new Date(1000*resultevent.time);
	timeElem.text(time.toString());

	// set the #views for question property in result
	var latitude = result.find('.latitude');
	
	if (resultevent.venue!= null){
		latitude.text(resultevent.venue.lat);

	var longitude = result.find('.longitude');
	
    longitude.text(resultevent.venue.lon);

    }
return result;
};
// this function takes the results object from Meetup
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query;
	return results;
};

var getMapCenter = function(result) {
	for (i = 0; i < result.length; i++) { 
        if (result[i].venue!= null) {
        	return new google.maps.LatLng(result[i].venue.lat, result[i].venue.lon);
	     }
    }
	return new google.maps.LatLng(-33.92, 151.25);
};

var getmeetupEvents = function(topic,city,country) {
	
	// the parameters we need to pass in our request to Meetup's API
	var request = {topic:topic,
								time: ',1w',
								city: city,
								country:country,
								key:"206f14111210445f16597c1f5b6e5e64"};
	
	//https://api.meetup.com/2/open_events.xml?topic=java&time=,1w&city=brisbane&country=au&key=206f14111210445f16597c1f5b6e5e64
	var result = $.ajax({
		url: "https://api.meetup.com/2/open_events?",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(result){
		
		var searchResults = showSearchResults(request.topic,result.results.length);

		$('.search-results').html(searchResults);

		$.each(result.results, function(i, item) {
			var resultevent = showEvent(item);
			$('.results').append(resultevent);
		});
		 populatedataongooglemap(result.results);


	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};
	var populatedataongooglemap= function(result){	
	var mapCenter = getMapCenter(result)	
    var map = new google.maps.Map(document.getElementById("maparea"), {
      zoom: 10,
      center: mapCenter,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    var infowindow = new google.maps.InfoWindow();

    var marker, i;

    for (i = 0; i < result.length; i++) { 
    if (result[i].venue!= null){
	 console.log(result[i].venue.lat);	
	 console.log(result[i].venue.lon);	
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(result[i].venue.lat, result[i].venue.lon),
        map: map
      });

      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          infowindow.setContent(result[i].name);
          infowindow.open(map, marker);
        }
      })(marker, i));
    }
    };
};

