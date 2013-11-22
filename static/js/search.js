var map;

jQuery(document).ready(function(){

    //set default location to Halifax Centroid
    function initDefaultLocation() {
	    var defaultLocation = new google.maps.LatLng('44.6522', '-63.6217'); 
	    return defaultLocation;
    }

    var position = initDefaultLocation(); 

    function setPosition(p){
        console.log(p);
        position = p;
    }

    function getPosition(){
        console.log("GET ", position);
        return position;
    }

    //reset position to user's location 
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(p){
        var defaultLocation = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
        setPosition(defaultLocation);
        initialize();
        getResults();
      });
    } else {
      initialize();
      getResults();
    }
  
    $('.left-sidebar').append($('<div/>', {
      id: "marker-info"
    }));

    $('.left-sidebar').append($('<div/>', {
      id: 'pagination'
    }));
    

    var iconBase = 'https://maps.google.com/mapfiles/kml/';
    // Creates the map
    function initialize() {

      //Default map center
      var ctr = getPosition();
   
      // Options
      var mapOptions = {
        center: ctr,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      // Create the map Object
      map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
    
      // Add center marker
      var marker = new google.maps.Marker({
          position: map.getCenter(),
          map: map,
          title: 'You',
          icon: iconBase + 'paddle/blu-stars-lv.png'
          });
    }

    google.maps.event.addDomListener(window, "resize", function() {
	var center = map.getCenter();
	google.maps.event.trigger(map, "resize");
	map.setCenter(center); 
    });

  //google.maps.event.addDomListener(window, 'load', initialize);
  var pageToFetch = 1;
  var resultMarkers = [];
  var openInfoWindow = null;

  // Ajax call to api to fetch results
  function getResults() {

    //Add form arguments

    var pos = getPosition();
    
    // Get values from form
    var program_type_id = $('#no_table_program_type_id option:selected').val();
    var age = $('#no_table_age:selected').val();
    var params = {
      program_type: program_type_id,
      age: [age],
      pos: {
        lat: pos.lat(), 
        lng: pos.lng()
      },
      page: pageToFetch
    }

    // Ajax api call to fetch results
    $.ajax({
        url: "api",
        dataType: "json",
        type: "POST",
        data: JSON.stringify(params),
    }).done(function(d){
      var page = parseInt(d.page);
      var numResults = parseInt(d.numResults);
      var agencies = d.agencies;

      console.log('success!');
      console.log(agencies);
        
      // Clear markers on map and empty sidebar
      clearMarkers();
      $markSidebar = $('#marker-info');
      $markSidebar.empty();

      // Write markers and infowindows on map
      for(var i = 0; i < 10; i++) {
        var agency = agencies[i];
                       
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(agency.lat, agency.lng),
          map: map,
          title: agency.name
        });

        
        var infoText = $('<div/>', { class: "marker"})
          .append(
            $("<div/>", { class: "marker-name" }).html(agency.name),
            $("<div/>", { class: "marker-street" }).html(agency.street),
            $("<div/>", { class: "marker-county" }).html(agency.county),
            $("<div/>", { class: "marker-email" }).html(agency.email)
          );

        $markSidebar.append( infoText );

        var infoWindow = new google.maps.InfoWindow({ content: infoText.html() });

        google.maps.event.addListener(marker, 'click', (function(marker, infoWindow){
            return function() {
                infoWindow.open(map, marker);
                if (openInfoWindow != null) {
                  openInfoWindow.close();
                }
                openInfoWindow = infoWindow;
            };
        })(marker, infoWindow));

        resultMarkers.push(marker);

      }

      // Generate the pagination
      var $pagination = $('#pagination');

      $pagination.empty();
      
      var prev = "";
      if (page > 1) {
        prev = "<<";
      }

      $pagination.append(
        $('<span/>', { class: 'change-page', 'data-page': page - 1 }).html(prev),
        $('<span/>', { 'data-page': page }).html('Page ' + page),
        $('<span/>', { class: 'change-page', 'data-page': page + 1 }).html('>>')
      );

      $('.change-page').on('click', function(){
        pageToFetch = $(this).attr('data-page');
        getResults();
      });

    }).fail(function(){
          alert('failed');
    }); // end ajax call

    return;

  } // end getResults function
  

  //clear markers function
  function clearMarkers() {
    for(var i = 0; i < resultMarkers.length; i++) {
      resultMarkers[i].setMap(null);
    }
    resultMarkers = [];
  }

  // Submit form
  jQuery('.search-form').submit(function(event) {		
    event.preventDefault();
    getResults();
  });
  

  // 
  function showInfo() {
  
  }

  $('.search-expand').click(function() {
      $('.search-form-wrapper').slideToggle()
  });


});
