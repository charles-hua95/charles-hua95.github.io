let map;
let markers = [];

const mapStyles = [
    {
        "featureType": "transit",
        "stylers": [
            { "visibility": "off" }
        ]
    }
];

let currentLanguage = 'zh-CN';

const translations = {
    en: {
        pageTitle: "Wage Theft Map",
        businessLabel: "Business",
        addressLabel: "Address",
        ownerLabel: "Owner",
        practicesLabel: "Practices",
        descriptionLabel: "Description",
        loadingText: "Loading photo..."
    },
    'zh-CN': {
        pageTitle: "工資盜竊地圖",
        businessLabel: "商業名稱",
        addressLabel: "地址",
        ownerLabel: "業主",
        practicesLabel: "惡劣行為",
        descriptionLabel: "描述",
        loadingText: "加載中..."
    }
};


document.getElementById('langEnBtn').addEventListener('click', function() {
    currentLanguage = 'en';
    updateLanguage();
    loadGoogleMapsAPI(currentLanguage);
});

document.getElementById('langZhBtn').addEventListener('click', function() {
    currentLanguage = 'zh-CN';
    updateLanguage();
    loadGoogleMapsAPI(currentLanguage);
});

function updateLanguage() {
    document.documentElement.lang = currentLanguage;
    document.getElementById('pageTitle').textContent = translations[currentLanguage].pageTitle;
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    fetchLocations();
}

function loadGoogleMapsAPI(language) {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
        document.head.removeChild(existingScript);
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAAWLLafU7wen4ObLkxT3rtY1jD39wne_4&callback=initMap&libraries=places&language=${language}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// Function to translate text using Cloud Translation API
async function translateText(text, targetLanguage) {
    const apiKey = 'AIzaSyAAWLLafU7wen4ObLkxT3rtY1jD39wne_4';
    const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const requestBody = {
        q: text,
        target: targetLanguage
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Translation request failed');
        }

        const data = await response.json();
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return null;
    }
}

// Initialize the map
window.initMap = function() {
    const chinatown = {lat: 43.653023233458946, lng: -79.39743229321462};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: chinatown,
        styles: mapStyles
    });
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
                    tagsString: headers.indexOf("Bad Practices (Tags)"),
                    description: headers.indexOf("Description"),
                    latitude: headers.indexOf("Latitude"),
                    longitude: headers.indexOf("Longitude"),
                    placeId: headers.indexOf("Place ID"),
                    verified:headers.indexOf("Verified")
                };

                console.log(`Column indices found:`, columnIndices);

                // Process each row excluding the header
                rows.slice(1).forEach(row => {
                    // Check if "Verified" is "Yes" before adding marker
                    if (row[columnIndices.verified] === "Yes") {
                    const latLng = new google.maps.LatLng(row[columnIndices.latitude], row[columnIndices.longitude]);
                    addMarker(latLng, row[columnIndices.name], row[columnIndices.address], row[columnIndices.owner], row[columnIndices.tagsString], row[columnIndices.description], row[columnIndices.placeId]);
                }});
            } else {
                console.log('No data found or empty rows.');
            }
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            alert('Failed to load data from Google Sheets. Check the console for more details.');
        });
}

const iconUrls = {
    defaultIcon: 'https://charles-hua95.github.io/basic-icon.png', // No specific tag
    wageTheft: 'https://charles-hua95.github.io/theft-icon.png', // Specific URL for "Wage theft"
    otherIssues: 'https://charles-hua95.github.io/abuse-icon.png' // Specific URL for "Abusive management" or "Intimidation"
};

async function addMarker(latLng, businessName, businessAddress, ownerName, tagsString, description, placeId) {
    const tags = tagsString ? tagsString.split(", ").map(tag => tag.trim().toLowerCase()) : [];

    // Determine the icon based on the tags
    let iconUrl = iconUrls.defaultIcon; // Default icon
    if (tags.includes("abusive management") || tags.includes("intimidation")) {
        iconUrl = iconUrls.otherIssues; // icon for wage theft
    } else if (tags.includes("wage theft")) {
        iconUrl = iconUrls.wageTheft; // icon for other issues
    }

    console.log(`Adding marker at ${latLng.toString()}`);

    const marker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(50, 50)
        },
        title: `${businessName}`
    });
    
    const infoWindow = new google.maps.InfoWindow();
    
    let isOpen = false;  // Track whether the infoWindow is open

    google.maps.event.addListener(marker, 'click', function () {
        if (isOpen) {
            infoWindow.close();
            isOpen = false;  // Update the state to closed
        } else {
            infoWindow.setContent(getContentString(businessName, businessAddress, ownerName, tagsString, description, placeId));
            infoWindow.open(map, marker);
            isOpen = true;   // Update the state to open
            if (placeId) {  // Load the photo if placeId is present
                loadPlacePhoto(placeId, `placePhoto-${placeId}`);
            } else {
                document.getElementById(`placePhoto-${placeId}`).innerHTML = '';
            }
        }
    });

    markers.push(marker);
}

async function getContentString(businessName, businessAddress, ownerName, tagsString, description, placeId) {
    const trans = translations[currentLanguage] || translations['zh-CN']; // Fallback to Chinese if undefined
    let contentString = '<div>';

    // Translate text if current language is Chinese
    if (currentLanguage === 'zh-CN') {
        businessAddress = await translateText(businessAddress, 'zh-CN');
        tagsString = await translateText(tagsString, 'zh-CN');
        description = await translateText(description, 'zh-CN');
    }

    if (placeId) {
        contentString += `<div id="placePhoto-${placeId}"><em>${trans.loadingText}</em></div>`;
    }
    if (businessAddress) {
        contentString += `<p><strong>${trans.addressLabel}:</strong> ${businessAddress}</p>`;
    }
    if (ownerName) {
        contentString += `<p><strong>${trans.ownerLabel}:</strong> ${ownerName}</p>`;
    }
    if (tagsString) {
        contentString += `<p><strong>${trans.practicesLabel}:</strong> ${tagsString}</p>`;
    }
    if (description) {
        contentString += `<p><strong>${trans.descriptionLabel}:</strong> ${description}</p>`;
    }

    contentString += '</div>';

    return contentString;
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