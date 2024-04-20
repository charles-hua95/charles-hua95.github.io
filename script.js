let map;
let markers = [];

function initMap() {
    // Coordinates for Toronto
    const toronto = {lat: 43.653023233458946, lng: -79.39743229321462};
    
    // Initialize the map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: toronto
    });

    // Fetch locations from Google Sheet and place markers
    fetchLocations();
}

function fetchLocations() {
    const sheetId = '1tIqLf1ljbiG5Q0lf6Jcoc3I5hwFRayTCdiATgP98f38';
    const apiKey = 'AIzaSyAAWLLafU7wen4ObLkxT3rtY1jD39wne_4';
    const range = 'A2:B100'; // Adjust the range based on your sheet's data
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            if (rows.length) {
                rows.forEach(row => {
                    const latLng = new google.maps.LatLng(row[0], row[1]);
                    addMarker(latLng);
                });
            }
        })
        .catch(error => console.error('Error fetching data: ', error));
}

function addMarker(latLng) {
    const marker = new google.maps.Marker({
        position: latLng,
        map: map,
        // Use a custom icon if you like - specify the URL as the icon property
        icon: {
            url: 'https://charles-hua95.github.io/charles-hua95.github.io/theft-icon.png', // URL to a custom icon
            scaledSize: new google.maps.Size(32, 32) // Adjust size as needed
        },
        title: 'Wage theft' // Tooltip for the marker
    });

    // Optional: Add an info window for each marker
    const infoWindow = new google.maps.InfoWindow({
        content: `<p>Marker at Latitude: ${latLng.lat()}, Longitude: ${latLng.lng()}</p>`
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    markers.push(marker); // Optionally, keep track of all markers
}

document.addEventListener('DOMContentLoaded', initMap);