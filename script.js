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
    const range = 'D2:E100'; // Adjust the range based on your sheet's data
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    console.log("Fetching data from Google Sheets...");

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Data received from Google Sheets:", data);
            const rows = data.values;
            if (rows && rows.length) {
                console.log(`${rows.length} locations fetched, processing...`);
                rows.forEach((row, index) => {
                    console.log(`Processing location ${index + 1}:`, row);
                    const latLng = new google.maps.LatLng(row[0], row[1]);
                    addMarker(latLng);
                });
            } else {
                console.log('No data found or empty rows.');
            }
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            alert('Failed to load data from Google Sheets. Check the console for more details.');
        });
}

function addMarker(latLng) {
    console.log(`Adding marker at ${latLng.toString()}`);
    const marker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: {
            url: 'https://charles-hua95.github.io/theft-icon.png',
            scaledSize: new google.maps.Size(32, 32)
        },
        title: 'Wage theft'
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `<p>Marker at Latitude: ${latLng.lat()}, Longitude: ${latLng.lng()}</p>`
    });

    marker.addListener('click', () => {
        console.log(`Marker at ${latLng.toString()} clicked.`);
        infoWindow.open(map, marker);
    });

    markers.push(marker);
}