// GLOBAL DECLARATIONS
var map;
var layerControl;
var basemaps;
var highlightLayer; // Layer for highlighting the country

// Tile layers
var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
});

basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

// Layer groups for toggles
var airportsLayer = L.layerGroup();
var citiesLayer = L.layerGroup();
var universitiesLayer = L.layerGroup();
var footballStadiumsLayer = L.layerGroup();

var overlayMaps = {
  "Airports": airportsLayer,
  "Cities": citiesLayer,
  "Universities": universitiesLayer,
  "Football Stadiums": footballStadiumsLayer
};

// Initialize Leaflet map and other functionalities
$(document).ready(function() {
  requestUserLocation(); // Request location on page load
  populateCountriesDropdown();
  setupEventListeners();
});

// Request the user's location
function requestUserLocation() {
  console.log('Requesting user location...');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        console.log('Location obtained:', position);
        const coordinates = [position.coords.latitude, position.coords.longitude];
        initializeMap(coordinates);
        saveUserLocation(coordinates);
        reverseGeocode(coordinates);
      },
      error => {
        console.error('Error getting location:', error);
        // Fallback to default location if there's an error
        initializeMap([54.5, -4]); // Default location
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
    // Fallback to default location if geolocation is not supported
    initializeMap([54.5, -4]); // Default location
  }
}

// Initialize Leaflet map
function initializeMap(coordinates) {
  console.log('Initializing map at coordinates:', coordinates);
  map = L.map("map", {
    layers: [streets]
  }).setView(coordinates, 6);

  layerControl = L.control.layers(basemaps, overlayMaps).addTo(map);

  L.easyButton('<i class="fas fa-info-circle"></i>', function(btn, map) {
    var selectedCountry = $('#countrySelect').val();
    if (selectedCountry) {
      openModal(selectedCountry, 'info');
    } else {
      alert('Please select a country from the dropdown.');
    }
  }, 'Show Info').addTo(map);
}

// Save user location in local storage
function saveUserLocation(coordinates) {
  console.log('Saving user location to localStorage:', coordinates);
  localStorage.setItem('userLocation', JSON.stringify(coordinates));
}

// Populate countries dropdown
function populateCountriesDropdown() {
  fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
      data.sort((a, b) => a.name.common.localeCompare(b.name.common));
      const selectElement = document.getElementById('countrySelect');
      data.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name.common;
        option.text = country.name.common;
        selectElement.appendChild(option);
      });
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.text = 'Select a country';
      defaultOption.selected = true;
      defaultOption.disabled = true;
      selectElement.insertBefore(defaultOption, selectElement.firstChild);
    })
    .catch(error => console.error('Error fetching country data:', error));
}

// Reverse geocode coordinates to get country name
function reverseGeocode(coordinates) {
  const [lat, lon] = coordinates;
  const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

  fetch(geocodeUrl)
    .then(response => response.json())
    .then(data => {
      const countryName = data.address.country;
      console.log('Country from coordinates:', countryName);
      setDropdownToCountry(countryName);
    })
    .catch(error => {
      console.error('Error reverse geocoding:', error);
    });
}

// Set the dropdown to a specific country
function setDropdownToCountry(countryName) {
  console.log('Setting dropdown to country:', countryName);
  const selectElement = document.getElementById('countrySelect');
  for (const option of selectElement.options) {
    if (option.value === countryName) {
      option.selected = true;
      $('#countrySelect').trigger('change'); // Trigger change event
      break;
    }
  }
}


// Event listeners
function setupEventListeners() {
  $('#countrySelect').change(function() {
    var selectedCountry = $(this).val();
    if (selectedCountry) {
      fetchCountryCoordinates(selectedCountry)
        .then(coordinates => {
          map.setView(coordinates, 6);
          return getCountryCode(selectedCountry);
        })
        .then(countryCode => {
          highlightCountry(selectedCountry);
          // Clear existing layers before loading new data
          clearLayer(citiesLayer);
          clearLayer(universitiesLayer);
          clearLayer(footballStadiumsLayer);
          clearLayer(airportsLayer);
          // Load data based on selected country
          loadCities(map, citiesLayer, countryCode); // Added this line
          loadUniversities(map, universitiesLayer, countryCode);
          loadFootballStadiums(map, footballStadiumsLayer, countryCode);
          loadAirports(map, airportsLayer, countryCode);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  });

  $('#currencyBtn').click(function(event) {
    event.preventDefault();
    $('#currencyModal').modal('show');
  });

  $('#convertCurrencyForm').submit(function(event) {
    event.preventDefault();
    const targetCurrency = $('#currencySelect').val();
    const amount = $('#amount').val();
    if (targetCurrency && amount) {
      convertCurrency(targetCurrency, amount);
    } else {
      displayConversionError();
    }
  });

  $('#wikiBtn').click(function(event) {
    event.preventDefault();
    $('#wikiModal').modal('show');
  });
}


// Fetch country coordinates
function fetchCountryCoordinates(countryName) {
  return fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0 && data[0].latlng) {
        return [data[0].latlng[0], data[0].latlng[1]];
      } else {
        throw new Error('Coordinates not found');
      }
    });
}

// Get country code
function getCountryCode(countryName) {
  return fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0 && data[0].cca2) {
        return data[0].cca2;
      } else {
        throw new Error('Country code not found');
      }
    });
}

// Convert currency
async function convertCurrency(targetCurrency, amount) {
  const baseCurrency = 'USD';

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    const { rates } = await response.json();
    if (rates[targetCurrency]) {
      const conversionRate = rates[targetCurrency];
      const convertedAmount = (amount * conversionRate).toFixed(2);
      $('#conversionResult').text(`Converted amount: ${convertedAmount} ${targetCurrency}`);
    } else {
      $('#conversionResult').text('Invalid currency code.');
    }
  } catch (error) {
    console.error('Error converting currency:', error);
    $('#conversionResult').text('Error converting currency.');
  }
}

// Display error for currency conversion
function displayConversionError() {
  $('#conversionResult').text('Please provide valid input for currency conversion.');
}

// Highlight the country
function highlightCountry(countryName) {
  if (highlightLayer) {
    map.removeLayer(highlightLayer);
  }

  fetchCountryCoordinates(countryName)
    .then(coordinates => {
      return fetch(`https://raw.githubusercontent.com/johan/world.geo.json/master/countries/${encodeURIComponent(countryName)}.geo.json`)
        .then(response => response.json())
        .then(data => {
          if (data && data.features && data.features.length > 0) {
            highlightLayer = L.geoJSON(data, {
              style: function (feature) {
                return {
                  color: 'red',
                  weight: 4,
                  opacity: 1,
                  fillColor: 'red',
                  fillOpacity: 0.2
                };
              }
            }).addTo(map);
            map.fitBounds(highlightLayer.getBounds());
          } else {
            console.error('No features found in GeoJSON data');
          }
        });
    })
    .catch(error => {
      console.error('Error fetching or processing GeoJSON:', error);
    });
}

// Load football stadiums
function loadFootballStadiums(map, layerGroup, countryCode) {
  const stadiumsUrl = `https://example.com/football-stadiums/${countryCode}.json`;

  fetch(stadiumsUrl)
    .then(response => response.json())
    .then(data => {
      data.forEach(stadium => {
        L.marker([stadium.latitude, stadium.longitude])
          .bindPopup(`<b>${stadium.name}</b><br>${stadium.city}`)
          .addTo(layerGroup);
      });
      layerGroup.addTo(map);
    })
    .catch(error => {
      console.error('Error loading football stadiums:', error);
    });
}

// Load universities
function loadUniversities(map, layerGroup, countryCode) {
  const universitiesUrl = `https://example.com/universities/${countryCode}.json`;

  fetch(universitiesUrl)
    .then(response => response.json())
    .then(data => {
      data.forEach(university => {
        L.marker([university.latitude, university.longitude])
          .bindPopup(`<b>${university.name}</b><br>${university.city}`)
          .addTo(layerGroup);
      });
      layerGroup.addTo(map);
    })
    .catch(error => {
      console.error('Error loading universities:', error);
    });
}

// Load airports
function loadAirports(map, layerGroup, countryCode) {
  const airportsUrl = `https://example.com/airports/${countryCode}.json`;

  fetch(airportsUrl)
    .then(response => response.json())
    .then(data => {
      data.forEach(airport => {
        L.marker([airport.latitude, airport.longitude])
          .bindPopup(`<b>${airport.name}</b><br>${airport.city}`)
          .addTo(layerGroup);
      });
      layerGroup.addTo(map);
    })
    .catch(error => {
      console.error('Error loading airports:', error);
    });
}

// Load cities
function loadCities(map, layerGroup, countryCode) {
  const citiesUrl = `https://example.com/cities/${countryCode}.json`;

  fetch(citiesUrl)
    .then(response => response.json())
    .then(data => {
      data.forEach(city => {
        L.marker([city.latitude, city.longitude])
          .bindPopup(`<b>${city.name}</b><br>${city.country}`)
          .addTo(layerGroup);
      });
      layerGroup.addTo(map);
    })
    .catch(error => {
      console.error('Error loading cities:', error);
    });
}


// Clear layer
function clearLayer(layer) {
  layer.clearLayers();
}

// Open modal and display country information
function openModal(countryName, type) {
  if (type !== 'info') {
    console.error('Unsupported type:', type);
    return;
  }

  fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`)
    .then(response => response.json())
    .then(data => {
      console.log('Country Data:', data);

      if (data.length > 0) {
        const country = data[0];
        const tableBody = document.getElementById('infoTableBody');
        tableBody.innerHTML = '';

        const rows = [
          { key: 'Country Name', value: country.name.common || 'N/A' },
          { key: 'Capital City', value: country.capital ? country.capital[0] : 'N/A' },
          { key: 'Population', value: country.population ? country.population.toLocaleString() : 'N/A' },
          { key: 'Region', value: country.region || 'N/A' },
          { key: 'Subregion', value: country.subregion || 'N/A' },
          { key: 'Languages', value: country.languages ? Object.values(country.languages).join(', ') : 'N/A' },
          { key: 'Currencies', value: country.currencies ? Object.values(country.currencies).map(currency => currency.name).join(', ') : 'N/A' }
        ];

        rows.forEach(row => {
          const tr = document.createElement('tr');
          const keyCell = document.createElement('td');
          keyCell.textContent = row.key;
          const valueCell = document.createElement('td');
          valueCell.textContent = row.value;
          tr.appendChild(keyCell);
          tr.appendChild(valueCell);
          tableBody.appendChild(tr);
        });

        const modal = new bootstrap.Modal(document.getElementById('infoModal'));
        modal.show();
      } else {
        console.error('No country data found');
        const tableBody = document.getElementById('infoTableBody');
        tableBody.innerHTML = `<tr><td colspan="2">No data available for ${countryName}.</td></tr>`;
        const modal = new bootstrap.Modal(document.getElementById('infoModal'));
        modal.show();
      }
    })
    .catch(error => {
      console.error('Error fetching country data:', error);
      const tableBody = document.getElementById('infoTableBody');
      tableBody.innerHTML = `<tr><td colspan="2">Error fetching data for ${countryName}. Please try again later.</td></tr>`;
      const modal = new bootstrap.Modal(document.getElementById('infoModal'));
      modal.show();
    });
}
