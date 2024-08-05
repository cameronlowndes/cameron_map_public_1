

// Function to load cities data and display it on the map
export function loadCities(map, citiesLayer, countryCode) {
    const username = 'cameron_2321'; // Ensure to replace with your GeoNames username
    const baseUrl = `http://api.geonames.org/searchJSON?featureCode=PPL&country=${countryCode}&orderby=population&maxRows=1000&username=${username}`;
    const maxCitiesToShow = 500; // Limit to 300 cities
    let cities = []; // Array to store cities
  
    // Fetch country data to get coordinates
    fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
      .then(response => response.json())
      .then(data => {
        if (data && data[0] && data[0].latlng) {
          // Fetch bounding box for the country
          return fetchBoundingBox(countryCode);
        } else {
          throw new Error('Country coordinates not found');
        }
      })
      .then(boundingBox => {
        if (boundingBox) {
          const [south, north, west, east] = boundingBox;
          fetchCities(0, north, south, east, west); // Start with row 0 and bounding box
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
  
    function fetchCities(startRow, north, south, east, west) {
      const url = `${baseUrl}&startRow=${startRow}&north=${north}&south=${south}&east=${east}&west=${west}`;
  
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data && data.geonames) {
            data.geonames.forEach(place => {
              if (place.lat && place.lng && place.name && place.countryCode) {
                cities.push(place);
              }
            });
  
            // Check if there are more results to fetch and if we haven't reached our city limit
            if (data.geonames.length === 1000 && cities.length < maxCitiesToShow) {
              fetchCities(startRow + 1000, north, south, east, west);
            } else {
              // Sort cities by population and select the top 300
              displayTopCities();
            }
          } else {
            console.warn('No cities found or incorrect data format');
          }
        })
        .catch(error => console.error('Error loading cities:', error));
    }
  
    function displayTopCities() {
      // Sort cities by population in descending order and select the top cities
      cities.sort((a, b) => b.population - a.population);
  
      const topCities = cities.slice(0, maxCitiesToShow);
  
      topCities.forEach(city => {
        if (city.lat && city.lng && city.name && city.countryName) {
          const marker = L.marker([city.lat, city.lng])
            .bindPopup(`<b>${city.name}</b><br>${city.countryName}`)
            .addTo(citiesLayer);
  
          // Add click event to the marker
          marker.on('click', function () {
          });
        }
      });
  
      // Only add the layer to the map if it contains markers
      if (citiesLayer.getLayers().length > 0) {
        citiesLayer.addTo(map);
      }
    }
  }

  