function fetchWeather(countryName) {
  var apiKey = 'af080b90f16545a0882122240231404'; 
  var endpoint = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${countryName}&aqi=no`;

  fetch(endpoint)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('Error fetching weather data:', data.error.message);
        alert(`Failed to fetch weather data for ${countryName}. Please try again later.`);
      } else {
        var weatherDescription = data.current.condition.text;
        var temperature = data.current.temp_c;
        var humidity = data.current.humidity;

        fetchForecast(data.location.lat, data.location.lon);

        $('#weatherModal .modal-body').html(`
          <h5>Current Weather in ${countryName}</h5>
          <p><strong>Description:</strong> ${weatherDescription}</p>
          <p><strong>Temperature:</strong> ${temperature} &deg;C</p>
          <p><strong>Humidity:</strong> ${humidity} %</p>
          <div id="forecast"></div>
        `);

        var weatherModal = new bootstrap.Modal(document.getElementById('weatherModal'));
        weatherModal.show();
      }
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
      alert(`Failed to fetch weather data for ${countryName}. Please try again later.`);
    });
}

function fetchForecast(lat, lon) {
  var apiKey = 'af080b90f16545a0882122240231404'; 
  var endpoint = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3&aqi=no&alerts=no`;

  fetch(endpoint)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('Error fetching forecast data:', data.error.message);
        $('#forecast').html('<p>Failed to fetch forecast data. Please try again later.</p>');
      } else {
        var forecastTable = '<h5>Forecast for the next 3 days</h5><table class="table table-striped">';
        for (var i = 0; i < 3; i++) {
          var date = new Date(data.forecast.forecastday[i].date_epoch * 1000);
          var day = date.toLocaleDateString('en', { weekday: 'short' });
          var description = data.forecast.forecastday[i].day.condition.text;
          var maxTemp = data.forecast.forecastday[i].day.maxtemp_c;
          var minTemp = data.forecast.forecastday[i].day.mintemp_c;
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
      }
    })
    .catch(error => {
      console.error('Error fetching forecast data:', error);
      $('#forecast').html('<p>Failed to fetch forecast data. Please try again later.</p>');
    });
}
