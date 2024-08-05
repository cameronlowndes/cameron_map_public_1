// main.js

import { openModal } from './countryInfo.js';  // Adjust the path as necessary
import { loadCities } from './cities.js';
import { loadAirports } from './airports.js';
import { fetchWikiContent } from './wiki.js'; // Import fetchWikiContent
import { showWeatherModal } from './weather.js'; // Import weather functions

// GLOBAL DECLARATIONS
let map;
let layerControl;
const basemaps = {};
const highlightLayer = L.layerGroup(); // Layer for highlighting the country


// Tile layers
const streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});

const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
});

basemaps["Streets"] = streets;
basemaps["Satellite"] = satellite;

// Layer groups for toggles
const airportsLayer = L.layerGroup();
const citiesLayer = L.layerGroup();
const universitiesLayer = L.layerGroup();
const footballStadiumsLayer = L.layerGroup();

const overlayMaps = {
  "Airports": airportsLayer,
  "Cities": citiesLayer,
  "Universities": universitiesLayer,
  "Football Stadiums": footballStadiumsLayer
};

// Initialize Leaflet map and other functionalities
$(document).ready(function() {
  requestUserLocation();
  populateCountriesDropdown();
  setupEventListeners();

  // Initialize currency functionality
  const currencyBtn = $('#currencyBtn');
  const convertCurrencyForm = $('#convertCurrencyForm');
  const resultContainer = $('#resultContainer');
  const currencySelect = $('#currencySelect');

  // Populate currency options on page load
  populateCurrencyOptions(currencySelect);

  currencyBtn.on('click', function(event) {
    event.preventDefault();
    handleCurrencyConversion(resultContainer, currencySelect);
  });

  convertCurrencyForm.on('submit', function(event) {
    event.preventDefault();
    handleCurrencyConversion(resultContainer, currencySelect);
  });
});

// Request the user's location
function requestUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const coordinates = [position.coords.latitude, position.coords.longitude];
        initializeMap(coordinates);
        saveUserLocation(coordinates);
        reverseGeocode(coordinates);
      },
      () => initializeMap([54.5, -4]), // Default location
      { enableHighAccuracy: true, timeout: 5000 }
    );
  } else {
    initializeMap([54.5, -4]); // Default location
  }
}

// Initialize Leaflet map
function initializeMap(coordinates) {
  map = L.map("map", {
    layers: [streets]
  }).setView(coordinates, 6);

  layerControl = L.control.layers(basemaps, overlayMaps).addTo(map);

  L.easyButton('<i class="fas fa-info-circle"></i>', function(btn, map) {
    const selectedCountry = $('#countrySelect').val();
    if (selectedCountry) {
      openModal(selectedCountry, 'info'); // Using the imported function
    } else {
      alert('Please select a country from the dropdown.');
    }
  }, 'Show Info').addTo(map);

  setupButtonListeners();
}

// Save user location in local storage
function saveUserLocation(coordinates) {
  localStorage.setItem('userLocation', JSON.stringify(coordinates));
}

// Populate countries dropdown
function populateCountriesDropdown() {
  fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
      data.sort((a, b) => a.name.common.localeCompare(b.name.common));
      const selectElement = $('#countrySelect');
      selectElement.empty(); // Clear existing options
      selectElement.append('<option value="" selected disabled>Select a country</option>');
      data.forEach(country => {
        selectElement.append(`<option value="${country.name.common}">${country.name.common}</option>`);
      });
    })
    .catch(error => console.error('Error fetching country data:', error));
}

// Reverse geocode coordinates to get country name
function reverseGeocode(coordinates) {
  const [lat, lon] = coordinates;
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`)
    .then(response => response.json())
    .then(data => setDropdownToCountry(data.address.country))
    .catch(error => console.error('Error reverse geocoding:', error));
}

// Set the dropdown to a specific country
function setDropdownToCountry(countryName) {
  const selectElement = $('#countrySelect');
  selectElement.val(countryName).trigger('change'); // Trigger change event
}

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




// Populate currency options
function populateCurrencyOptions(selectElement) {
  fetch('https://api.exchangerate-api.com/v4/latest/USD')
    .then(response => response.json())
    .then(data => {
      Object.keys(data.rates).forEach(currency => {
        selectElement.append(`<option value="${currency}">${currency}</option>`);
      });
    })
    .catch(error => console.error('Error fetching currency data:', error));
}

// Setup event listeners for buttons and other interactions
function setupEventListeners() {
  const weatherBtn = document.getElementById('weatherBtn');
  const countrySelect = document.getElementById('countrySelect'); // Ensure this exists

  // Check if the weather button and country select elements exist
  if (!weatherBtn || !countrySelect) {
    console.error('Required elements are missing.');
    return;
  }

  weatherBtn.addEventListener('click', function(event) {
    event.preventDefault();

    const selectedCountry = countrySelect.value;
    
    if (selectedCountry) {
      showWeatherModal(selectedCountry);
    } else {
      alert('Please select a country first.');
    }
  });
}

// Setup button listeners
function setupButtonListeners() {
  $('#cityBtn').on('click', function() {
    loadCities(map, citiesLayer); // Using imported function
  });

  $('#airportBtn').on('click', function() {
    loadAirports(map, airportsLayer); // Using imported function
  });

  $('#universityBtn').on('click', function() {
    loadUniversities(map, universitiesLayer); // Assuming similar function exists
  });

  $('#footballStadiumBtn').on('click', function() {
    loadFootballStadiums(map, footballStadiumsLayer); // Assuming similar function exists
  });

  $('#wikiBtn').on('click', function() {
    const selectedCountry = $('#countrySelect').val();
    if (selectedCountry) {
      fetchWikiContent(selectedCountry) // Using the imported function
        .then(content => {
          $('#wikiContent').html(content);
        })
        .catch(error => console.error('Error fetching wiki content:', error));
    } else {
      alert('Please select a country first.');
    }
  });
}
