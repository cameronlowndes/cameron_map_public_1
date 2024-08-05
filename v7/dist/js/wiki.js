document.addEventListener('DOMContentLoaded', function() {
  const wikiBtn = document.getElementById('wikiBtn');
  
  wikiBtn.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default action

    // Get the current map center coordinates
    const centerCoordinates = map.getCenter();
    
    // Fetch the country based on the center coordinates
    fetchCountryName(centerCoordinates.lat, centerCoordinates.lng)
      .then(countryName => {
        if (countryName) {
          // Construct Wikipedia URL for the country
          const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`;
          window.open(wikiUrl, '_blank'); // Open the Wikipedia page in a new tab
        } else {
          alert('Country not found for the current location.');
        }
      })
      .catch(error => {
        console.error('Error fetching country name:', error.message);
        alert('Failed to fetch country name. Please try again later.');
      });
  });

  async function fetchCountryName(lat, lng) {
    try {
      // Reverse geocoding to get country name based on coordinates
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      const countryName = data.address && data.address.country ? data.address.country : null;
      return countryName;
    } catch (error) {
      console.error('Error fetching country name:', error.message);
      throw error;
    }
  }
});
