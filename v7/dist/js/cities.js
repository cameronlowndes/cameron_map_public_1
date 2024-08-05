function loadCities(map, citiesLayer, countryCode) {
    const username = 'cameron_2321'; 
    const baseUrl = `http://api.geonames.org/searchJSON?featureCode=PPL&country=${countryCode}&orderby=population&maxRows=1000&username=${username}`; // Adjust maxRows as needed
    let totalFetched = 0; // Keep track of the total number of places fetched
    const maxAllowed = 5000; // Maximum allowed by the free API

    function fetchCities(startRow = 0) {
        if (totalFetched >= maxAllowed) {
            console.warn('Reached the maximum number of results allowed by the free GeoNames API.');
            return;
        }

        const url = `${baseUrl}&startRow=${startRow}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.geonames) {
                    data.geonames.forEach(place => {
                        if (place.lat && place.lng && place.name && place.countryCode) {
                            L.marker([place.lat, place.lng])
                                .bindPopup(`<b>${place.name}</b><br>${place.countryName}`)
                                .addTo(citiesLayer);
                        }
                    });

                    totalFetched += data.geonames.length;

                    // Check if there are more results to fetch
                    if (data.geonames.length === 1000 && totalFetched < maxAllowed) { // Adjust based on maxRows and check against maxAllowed
                        fetchCities(startRow + 1000);
                    } else {
                        // Only add the layer to the map if it contains markers
                        if (citiesLayer.getLayers().length > 0) {
                            citiesLayer.addTo(map);
                        }
                    }
                } else {
                    console.error('Data format is incorrect:', data);
                }
            })
            .catch(error => console.error('Error loading cities data:', error));
    }

    fetchCities();
}
