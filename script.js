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
                const nameIndex = headers.indexOf("Name of Business");
                const addressIndex = headers.indexOf("Address of Business");
                const ownerIndex = headers.indexOf("Name of Owner");
                const tagsIndex = headers.indexOf("Bad Practices (Tags)");
                const descriptionIndex = headers.indexOf("Description");
                const latIndex = headers.indexOf("Latitude");
                const lngIndex = headers.indexOf("Longitude");

                console.log(`Found indices - Name: ${nameIndex}, Address: ${addressIndex}, Owner: ${ownerIndex}, Tags: ${tagsIndex}, Description: ${descriptionIndex}, Latitude: ${latIndex}, Longitude: ${lngIndex}`);

                // Process each row excluding the header
                for (let i = 1; i < rows.length; i++) {
                    let row = rows[i];
                    const latLng = new google.maps.LatLng(row[latIndex], row[lngIndex]);
                    addMarker(latLng, row[nameIndex], row[addressIndex], row[ownerIndex], row[tagsIndex], row[descriptionIndex]);
                }
            } else {
                console.log('No data found or empty rows.');
            }
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            alert('Failed to load data from Google Sheets. Check the console for more details.');
        });
}

function addMarker(latLng, businessName, businessAddress, ownerName, tags, description) {
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

    const infoContent = `
    <div>
        <h3>Business: ${businessName}</h3> Address:</strong> ${businessAddress}
        <p><strong>Owner:</strong> ${ownerName}</p>
        <p><strong>Practices:</strong> ${tags}</p>
        <p><strong>Description:</strong> ${description}</p>
    </div>
`;

const infoWindow = new google.maps.InfoWindow({
    content: infoContent
});

marker.addListener('click', () => {
    console.log(`Marker at ${latLng.toString()} clicked.`);
    infoWindow.open(map, marker);
});

markers.push(marker);
}