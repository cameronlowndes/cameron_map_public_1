// weather.js

// Function to fetch current weather for a country
export async function fetchWeather(countryName) {
  try {
    const response = await fetch(`php/fetch_weather.php?action=current&location=${encodeURIComponent(countryName)}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

// Function to fetch weather forecast for given coordinates
export async function fetchForecast(lat, lon) {
  try {
    const response = await fetch(`php/fetch_weather.php?action=forecast&lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
}

// Function to handle fetching and displaying weather data
export async function showWeatherModal(countryName) {
  try {
    const weatherData = await fetchWeather(countryName);
    const { current, location } = weatherData;

    // Ensure current and location are defined
    if (!current || !location) {
      throw new Error('Weather data is incomplete');
    }

    const weatherDescription = current.condition ? current.condition.text : 'No description available';
    const temperature = current.temp_c !== undefined ? current.temp_c : 'No temperature data';
    const humidity = current.humidity !== undefined ? current.humidity : 'No humidity data';

    await showForecast(location.lat, location.lon);

    $('#weatherModal .modal-body').html(`
      <h5>Current Weather in ${countryName}</h5>
      <p><strong>Description:</strong> ${weatherDescription}</p>
      <p><strong>Temperature:</strong> ${temperature} &deg;C</p>
      <p><strong>Humidity:</strong> ${humidity} %</p>
      <div id="forecast"></div>
    `);

    const weatherModal = new bootstrap.Modal(document.getElementById('weatherModal'));
    weatherModal.show();
  } catch (error) {
    console.error('Error showing weather modal:', error);
    alert(`Failed to fetch weather data for ${countryName}. Please try again later.`);
  }
}

// Function to handle fetching and displaying weather forecast
export async function showForecast(lat, lon) {
  try {
    const forecastData = await fetchForecast(lat, lon);
    const forecast = forecastData.forecast.forecastday;

    let forecastTable = '<h5>Forecast for the next 3 days</h5><table class="table table-striped">';
    for (let i = 0; i < 3; i++) {
      const date = new Date(forecast[i].date_epoch * 1000);
      const day = date.toLocaleDateString('en', { weekday: 'short' });
      const description = forecast[i].day.condition.text;
      const maxTemp = forecast[i].day.maxtemp_c;
      const minTemp = forecast[i].day.mintemp_c;
      forecastTable += `
        <tr>
          <td>${day}</td>
          <td>${description}</td>
          <td>Max: ${maxTemp} &deg;C</td>
          <td>Min: ${minTemp} &deg;C</td>
        </tr>
      `;
    }
    forecastTable += '</table>';
    $('#forecast').html(forecastTable);
  } catch (error) {
    console.error('Error showing forecast:', error);
    $('#forecast').html('<p>Failed to fetch forecast data. Please try again later.</p>');
  }
}
