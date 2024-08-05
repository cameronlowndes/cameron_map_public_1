// airports.js

export function loadAirports(map, layerGroup, countryCode) {
    const username = 'cameron_2321'; 
    const baseUrl = `http://api.geonames.org/searchJSON?featureCode=AIRP&username=${username}&maxRows=1000`;

    // Fetch country data to get coordinates
    fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
        .then(response => response.json())
        .then(data => {
            if (data && data[0] && data[0].latlng) {
                const [lat, lng] = data[0].latlng;

                // Fetch bounding box for the country
                return fetchBoundingBox(countryCode);
            } else {
                throw new Error('Country coordinates not found');
            }
        })
        .then(boundingBox => {
            if (boundingBox) {
                const [south, north, west, east] = boundingBox; // Adjust order if needed
                fetchAirports(0, north, south, east, west); // Start with row 0
            } else {
                throw new Error('Bounding box not found');
            }
        })
        .catch(error => console.error('Error:', error));

    function fetchBoundingBox(countryCode) {
        const boundingBoxUrl = `https://nominatim.openstreetmap.org/search.php?q=${encodeURIComponent(countryCode)}&format=json&limit=1`;

        return fetch(boundingBoxUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data[0] && data[0].boundingbox) {
                    return data[0].boundingbox; // Return the bounding box array [south, north, west, east]
                } else {
                    throw new Error('Bounding box not found');
                }
            })
            .catch(error => {
                console.error('Error fetching bounding box data:', error);
                return null; // Return null if there's an error
            });
    }

    function fetchAirports(startRow, north, south, east, west) {
        const url = `${baseUrl}&startRow=${startRow}&north=${north}&south=${south}&east=${east}&west=${west}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.geonames) {
                    data.geonames.forEach(airport => {
                        if (airport.lat && airport.lng) {
                            L.marker([airport.lat, airport.lng])
                                .bindPopup(`<b>${airport.name}</b><br>${airport.adminName1}, ${airport.countryName}`)
                                .addTo(layerGroup);
                        }
                    });

                    // Check if there are more results to fetch
                    if (data.geonames.length === 1000) { // Adjust based on maxRows
                        fetchAirports(startRow + 1000, north, south, east, west);
                    }
                } else {
                    console.warn('No airports found or incorrect data format');
                }
            })
            .catch(error => console.error('Error loading airports:', error));
    }
}
