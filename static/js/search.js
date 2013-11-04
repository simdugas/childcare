jQuery(document).ready(function(){
    
    $("#no_table_userlocation").hide();
    $("#no_table_userlocation__label").hide();


    //set the location on the page load
    if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(p){
	    setPosition(p);
	});
    } else {
	setPosition(initDefaultLocation());
    }
    
    defaultLocation = new Object();
    //set default locatin to Halifax Centroid
    function initDefaultLocation() {
	defaultLocation.timestamp = new Date().getTime();
	defaultLocation.coords = new Object();
	defaultLocation.coords.latitude = '44.6522';
	defaultLocation.coords.longitude = '-63.6217';

	return defaultLocation;
    }

    var position;
    function setPosition(p){
	position = p;
    }

    function getPosition(){
	return position;
    }

    jQuery('.search-form').submit(function(event) {		
	//add user location to query string
	$("#no_table_userlocation").val(JSON.stringify(position));
    });

});
