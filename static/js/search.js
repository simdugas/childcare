

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

    $("#no_table_userlocation").hide();
    $("#no_table_userlocation__label").hide();

    

    jQuery('.search-form').submit(function(event) {		
        //add user location to query string
        $("#no_table_userlocation").val(JSON.stringify(position));
    });

    // Creates the map
    function initialize() {

        //Default map center
        var ctr = getPosition();
     
        // Options
        var mapOptions = {
          center: new google.maps.LatLng(ctr),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // Create the map Object
        map = new google.maps.Map(document.getElementById("map-canvas"),
          mapOptions);

        var marker = new google.maps.Marker({
            position: map.getCenter(),
            map: map,
            title: 'You'
            });
        /*
        google.maps.event.addListener(map, 'center_changed', function(){
          window.setTimeout(function(){
            map.panTo(marker.getPosition());
            }, 3000);
          });
        */
        // Add agency markers
        /*
        
        }*/
    }
  
  
  google.maps.event.addDomListener(window, 'load', initialize);

  //reset position to user's location 
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(p){
      
      var defaultLocation = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
      setPosition(defaultLocation);
      map.setCenter(getPosition());
      var marker = new google.maps.Marker({
            position: map.getCenter(),
            map: map,
            title: 'You',
            });
      map.panTo(marker.position);
      map.setZoom(14);
      });
  }
  
  $.ajax({
      url: "api",
      dataType: "json",
      type: "POST",
      data: JSON.stringify({lat: getPosition().lat(), lng: getPosition().lng()}),
    })
    .done(function(agencies){
      console.log('success!');
      console.log(agencies);
      for(var i = 0; i < agencies.length; i++) {
        var agency = agencies[i];
        //Information popup
                 
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(agency.lat, agency.lng),
          map: map,
          title: agency.name
          });
      }
    })
    .fail(function(){
      alert('failed');
      });
      

});
