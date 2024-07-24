// Function to load football stadiums dynamically based on the selected country
function loadFootballStadiums(map, layer, countryCode) {
    const geoNamesUsername = 'cameron_2321';
    const searchQuery = 'stadium'; // Query for places with "stadium" in the name
    const apiUrl = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(searchQuery)}&country=${countryCode}&maxRows=100&username=${geoNamesUsername}`;

    fetch(apiUrl)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => { throw new Error(`API Error: ${text}`); });
            }
        })
        .then(data => {
            console.log('GeoNames Data:', data);

            layer.clearLayers(); // Clear existing markers before adding new ones

            // Check if 'geonames' is a valid property and process data
            if (data.geonames) {
                data.geonames.forEach(place => {
                    if (place.lat && place.lng && place.name) {
                        // Adding marker for each stadium-like place
                        L.marker([place.lat, place.lng])
                            .bindPopup(`<b>${place.name}</b><br>${place.adminName1 || 'Unknown Location'}`)
                            .addTo(layer);
                    }
                });

                if (!map.hasLayer(layer)) {
                    layer.addTo(map); // Ensure the layer is added to the map
                }

                console.log('Football stadiums loaded successfully');
            } else {
                console.error('Unexpected data format:', data);
            }
        })
        .catch(error => {
            console.error('Error loading football stadiums data:', error);
        });
}
