// Function to fetch and display Wikipedia content based on the country name
export async function fetchWikiContent(countryName) {
  try {
    // Construct Wikipedia URL for the country
    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`;
    window.open(wikiUrl, '_blank'); // Open the Wikipedia page in a new tab
  } catch (error) {
    console.error('Error fetching Wikipedia content:', error.message);
    alert('Failed to fetch Wikipedia page. Please try again later.');
  }
}

// Helper function to fetch the country name based on latitude and longitude
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
