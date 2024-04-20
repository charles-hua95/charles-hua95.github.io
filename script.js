let map;
let markers = [];

function initMap() {
    // Coordinates for chinatown
    const chinatown = {lat: 43.653023233458946, lng: -79.39743229321462};
    
    // Initialize the map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: chinatown
    });

    // Fetch locations from Google Sheet and place markers
    fetchLocations();
}

function fetchLocations() {
    const sheetId = '1tIqLf1ljbiG5Q0lf6Jcoc3I5hwFRayTCdiATgP98f38';
    const apiKey = 'AIzaSyAAWLLafU7wen4ObLkxT3rtY1jD39wne_4';
    const range = 'A1:L100';
    
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
            if (rows && rows.length > 1) {
                // Extract headers and find indices
                const headers = rows[0];
                const columnIndices = {
                    name: headers.indexOf("Name of Business"),
                    address: headers.indexOf("Address of Business"),
                    owner: headers.indexOf("Name of Owner"),
                    tags: headers.indexOf("Tags"),
                    description: headers.indexOf("Description"),
                    latitude: headers.indexOf("Latitude"),
                    longitude: headers.indexOf("Longitude"),
                    placeId: headers.indexOf("Place ID")
                };

                console.log(`Column indices found:`, columnIndices);

                // Process each row excluding the header
                rows.slice(1).forEach(row => {
                    const latLng = new google.maps.LatLng(row[columnIndices.latitude], row[columnIndices.longitude]);
                    addMarker(latLng, row[columnIndices.name], row[columnIndices.address], row[columnIndices.owner], row[columnIndices.tags], row[columnIndices.description], row[columnIndices.placeId]);
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

function addMarker(latLng, businessName, businessAddress, ownerName, tags, description, placeId) {

    let contentString = '<div>';

    if (businessName) {
        contentString += `<h3>Business: ${businessName}</h3>`;
    }
    if (placeId) {
        contentString += `<div id="placePhoto-${placeId}"><em>Loading photo...</em></div>`;
    }
    if (businessAddress) {
        contentString += `<p><strong>Address:</strong> ${businessAddress}</p>`;
    }
    if (ownerName) {
        contentString += `<p><strong>Owner:</strong> ${ownerName}</p>`;
    }
    if (tags) {
        contentString += `<p><strong>Practices:</strong> ${tags}</p>`;
    }
    if (description) {
        contentString += `<p><strong>Description:</strong> ${description}</p>`;
    }

    contentString += '</div>';

    const infoWindow = new google.maps.InfoWindow({
        content: contentString
    });
    
    console.log(`Adding marker at ${latLng.toString()}`);

    const marker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: {
            url: 'https://charles-hua95.github.io/theft-icon.png',
            scaledSize: new google.maps.Size(32, 32)
        },
        title: `${businessName}`
    });
    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open(map, marker);
        if (placeId) {  // Load the photo if placeId is present
            loadPlacePhoto(placeId, `placePhoto-${placeId}`);
        } else {
            document.getElementById(`placePhoto-${placeId}`).innerHTML = '';
        }
    });

    markers.push(marker);
}

function loadPlacePhoto(placeId, containerId) {
    const service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: placeId,
        fields: ['photo']
    }, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && place.photos && place.photos.length > 0) {
            const photoUrl = place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200});
            const photoHtml = `<img src="${photoUrl}" alt="Place Image" style="width:100%; height:auto;">`;
            document.getElementById(containerId).innerHTML = photoHtml;
        } else {
            // Clear the container or leave it unchanged depending on desired behavior
            document.getElementById(containerId).innerHTML = ''; // Clears the photo container if no photo is found
        }
    });
}