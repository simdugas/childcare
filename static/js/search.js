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


    // $("#no_table_userlocation").hide();
    // $("#no_table_userlocation__label").hide();

    

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
          title: 'You'
          });
    }

  //google.maps.event.addDomListener(window, 'load', initialize);

  var page = 0;
  var resultMarkers = [];

  // Ajax call to api to fetch results
  function getResults() {
    var pos = getPosition();
    
    // Get values from form
    var program_type_id = $('#no_table_program_type_id option:selected').val();
    var age = $('#no_table_age:selected').val();
    page++;
    var params = {
      program_type: program_type_id,
      age: [age],
      pos: {
        lat: pos.lat(), 
        lng: pos.lng()
      },
      page: page
    }
    $.ajax({
        url: "api",
        dataType: "json",
        type: "POST",
        data: JSON.stringify(params),
    }).done(function(agencies){
      console.log('success!');
      console.log(agencies);

      clearMarkers();

      for(var i = 0; i < 10; i++) {
        var agency = agencies[i];
        //Information popup
                       
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(agency.lat, agency.lng),
          map: map,
          title: agency.name
        });
        resultMarkers.push(marker);

      }
    }).fail(function(){
          alert('failed');
    });

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


  
});
