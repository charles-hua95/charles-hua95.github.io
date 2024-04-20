function initMap() {
    // Coordinates for Chinatown
    const chinatown = {lat: 43.653023233458946, lng: -79.39743229321462};
    
    // Initialize the map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: chinatown
    });

    var marker = new google.maps.Marker({position: uluru, map: map});
}