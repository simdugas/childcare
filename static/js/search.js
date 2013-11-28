var map;

jQuery(document).ready(function(){

    //set default location to Halifax Centroid
    function initDefaultLocation() {
	    var defaultLocation = new google.maps.LatLng('44.6522', '-63.6217'); 
	    return defaultLocation;
    }

    var position = initDefaultLocation(); 

    function setPosition(p){
        position = p;
    }

    function getPosition(){
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

    //sets the width of the map container
    function setMapContainerWidth(){
      if($(window).width() > 767) {
        $('.span9').width($('.main').width() - $('.left-sidebar').width());
      } else {
        $('.span9').width($('.span9').parent().width());
      }
    }

    //set initial map width
    setMapContainerWidth(); 

    var iconBase = 'https://maps.google.com/mapfiles/kml/';
    // Creates the map
    function initialize() {

      //Default map center
      var ctr = getPosition();
   
      // Options
      var mapOptions = {
        center: ctr,
        zoom: 14,
        panControl: false,
        zoomControl: false,
        scaleControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        overviewMapControl: false,
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
      setMapContainerWidth();
      
      var center = map.getCenter();
      google.maps.event.trigger(map, "resize");
      map.setCenter(center); 
    });

  //google.maps.event.addDomListener(window, 'load', initialize);
  var pageToFetch = 1;
  //globals
  resultDict = {};
  resultMarkers = [];
  resultInfoWindows = [];
  listeners = [];
  openInfoWindow = null;

  //function that displays infoWindow
  function displayInfoWindow(innerKey, resultInfoWindows, resultMarkers){

    var targetInfoWindow = resultInfoWindows[innerKey];
    var targetMarker = resultMarkers[innerKey];
    var center = targetMarker.getPosition();
    
    map.panTo(center);
    map.setZoom(16);

    if (openInfoWindow != null) {
      openInfoWindow.close();
    }

    targetInfoWindow.open(map, targetMarker); 
        
    openInfoWindow = targetInfoWindow;

  }

  
  // Ajax call to api to fetch results
  function getResults() {

    //Add form arguments

    var pos = getPosition();
    
    // Get values from form
    var params = {};
    params.pos = {
      lat: pos.lat(), 
      lng: pos.lng()
    };

    var program_type = $('#no_table_program_type_id option:selected').val();
    if(program_type != undefined && program_type != '') {
      params.program_type = program_type
    }

    var age = $('#no_table_age:selected').val();
    if(age != undefined && age != '') {
      params.ages = [age]
    }

    // Ajax api call to fetch results
    $.ajax({
        url: "api",
        dataType: "json",
        type: "POST",
        data: JSON.stringify(params),
    }).done(function(d){
      //create data objects
      var page = parseInt(d.page);
      var numResults = parseInt(d.numResults);
      var agencies = d.agencies;

      // Clear markers on map and empty sidebar
      clearMarkers(resultMarkers, resultInfoWindows);

      $markSidebar = $('#marker-info');
      $markSidebar.empty();

      //reset markers and infoWindows
      resultDict = {};
      resultMarkers = [];
      resultInfoWindows = [];

      // Create bounds to set map zoom
      var bounds = new google.maps.LatLngBounds();

      // Write markers and infowindows on map
      for(var i = 0; i < 10; i++) {
        var agency = agencies[i];
        var center = new google.maps.LatLng(agency.lat, agency.lng);
    
        // add point to bounds
        bounds.extend(center);
    
        //get the marker/infowindow key
        var key = resultMarkers.length;

        //add key to result dictionary
        resultDict[agency.id] = key;


        //create the marker
        var marker = new google.maps.Marker({
          position: center, 
          map: map,
          title: agency.name
        });
        
        //add marker to array
        resultMarkers.push(marker);

        
        //create the infowindow html
        var phone_numbers = 
            $("<div/>", { class: "marker-phone-numbers" }).html(agency.name);
        
        for(var j = 0; j < agency.phone_numbers.length; j++) {
          phone_numbers.append(
            $("<div/>", { class: "marker-phone-number" }).html(agency.phone_numbers[j])
          );
        }

        var infoText = $('<div/>', { 
            class: "marker",
            "data-id": agency.id,
            "data-childcare-provider-id": agency.childcare_provider_id,
            "data-lat": agency.lat,
            "data-lng": agency.lng
        }).append(
            $("<div/>", { class: "marker-name" }).html(agency.name),
            $("<div/>", { class: "marker-street" }).html(agency.street),
            $("<div/>", { class: "marker-county" }).html(agency.county),
            phone_numbers,
            $("<div/>", { class: "marker-email" }).html(agency.email),
            $("<a />",  { 
              class: "marker-violations",
              target: "_blank",
              href: "https://nsbr-online-services.gov.ns.ca"
                + "/DCSOnline/ECDS/displayViolationsPage.action?facID=" 
                + agency.childcare_provider_id
            }).html("violations")
          );
        
        //add infoText to the sidebar
        $markSidebar.append( infoText );

        // create infoWindow
        var infoWindow = new google.maps.InfoWindow({ content: infoText.html() });

        //add to results array
        resultInfoWindows.push(infoWindow);

        //create event listener for the marker
        listeners.push(
          google.maps.event.addListener(resultMarkers[key], 'click', function(innerKey){
            return function(){
              displayInfoWindow(innerKey, resultInfoWindows, resultMarkers);
            };
          }(key))
        );
      } //end for loop

      $('.left-sidebar #marker-info').unbind();
      $('.left-sidebar #marker-info').on('click', '.marker', function(){ 

        var key = resultDict[$(this).attr('data-id')];

        displayInfoWindow(key, resultInfoWindows, resultMarkers);

      });

      // set map zoom
      map.fitBounds(bounds);

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
  function clearMarkers(resultMarkers, resultInfoWindows) {
    for(var i = 0; i < resultMarkers.length; i++) {
      resultMarkers[i].setMap(null);
    }
    resultMarkers = [];
    for(var i = 0; i < resultInfoWindows.length; i++) {
      resultInfoWindows[i].setMap(null);
    }
    openInfoWindow = null;
    for(var i = 0; i < listeners.length; i++) {
      google.maps.event.removeListener(listeners[i]);
    }
    listeners = [];
  }

  // Submit form
  jQuery('.search-form').submit(function(event) {		
    event.preventDefault();
    getResults();
  });
  
  $('.search-expand').click(function() {
      $('.search-form-wrapper').slideToggle()
  });

});



