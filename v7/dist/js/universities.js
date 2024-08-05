function loadUniversities(map, universitiesLayer, countryCode) {
  // Replace with actual GeoNames or other university data API
  const username = 'cameron_2321'; 
  const apiUrl = `http://api.geonames.org/searchJSON?featureCode=UNIV&country=${countryCode}&username=${username}&maxRows=1000`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data && data.geonames) {
        universitiesLayer.clearLayers(); // Clear existing universities before adding new ones

        data.geonames.forEach(university => {
          if (university.lat && university.lng && university.name) {
            L.marker([university.lat, university.lng])
              .bindPopup(`<b>${university.name}</b><br>${university.countryName}`)
              .addTo(universitiesLayer);
          } else {
            console.warn('Missing required data for university:', university);
          }
        });

        universitiesLayer.addTo(map); // Add layer to map after adding markers
      } else {
        console.error('Unexpected data format:', data);
      }
    })
    .catch(error => console.error('Error loading universities data:', error));
}