document.addEventListener('DOMContentLoaded', function() {
  const newsBtn = document.getElementById('newsButton');
  const countrySelect = document.getElementById('countrySelect');

  let countryCodeMap = {}; // Will store country names and codes dynamically

  // Fetch country codes and names
  async function fetchCountryCodes() {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all');
      if (!response.ok) {
        throw new Error('Failed to fetch country data');
      }
      const countries = await response.json();
      
      countryCodeMap = countries.reduce((map, country) => {
        if (country.cca2 && country.name && country.cca2.length === 2) {
          map[country.name.common] = country.cca2.toLowerCase();
        }
        return map;
      }, {});

      populateCountrySelect(); // Populate the dropdown once data is fetched
    } catch (error) {
      console.error('Error fetching country codes:', error);
      alert('Failed to load country data. Please try again later.');
    }
  }

  // Populate the country dropdown with fetched country names
  function populateCountrySelect() {
    const selectElement = document.getElementById('countrySelect');
    selectElement.innerHTML = ''; // Clear any existing options
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select a country';
    defaultOption.selected = true;
    defaultOption.disabled = true;
    selectElement.appendChild(defaultOption);

    Object.keys(countryCodeMap).forEach(countryName => {
      const option = document.createElement('option');
      option.value = countryName;
      option.text = countryName;
      selectElement.appendChild(option);
    });
  }

  // Initialize fetching of country codes
  fetchCountryCodes();

  newsBtn.addEventListener('click', async function(event) {
    event.preventDefault();

    const selectedCountry = countrySelect.value;
    const countryCode = countryCodeMap[selectedCountry];
    
    if (countryCode) {
      try {
        const news = await fetchPopularNews(countryCode);
        displayNews(news);
      } catch (error) {
        console.error('Error fetching news:', error.message);
        alert('Failed to fetch news. Please try again later.');
      }
    } else {
      alert('Please select a country first.');
    }
  });

  async function fetchPopularNews(countryCode) {
    const url = `php/fetch_news.php?country=${countryCode}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Log the full API response
      
      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      if (data.totalResults === 0) {
        throw new Error('No articles found for the selected country');
      }

      return data.articles;
    } catch (error) {
      console.error('Error fetching news:', error.message);
      throw error; // Ensure errors are propagated to be handled in the click event handler
    }
  }
  
  function displayNews(articles) {
    const newsModal = new bootstrap.Modal(document.getElementById('newsModal'), {
      backdrop: 'static'
    });

    if (articles.length === 0) {
      document.getElementById('newsContent').innerHTML = '<p>No news articles found for the selected country.</p>';
    } else {
      let newsContent = '<ul class="list-group">';
      articles.forEach(article => {
        newsContent += `
          <li class="list-group-item">
            ${article.urlToImage ? `<img src="${article.urlToImage}" alt="Image" class="img-fluid mb-2" />` : ''}
            <h5 class="mb-1">${article.title}</h5>
            ${article.source ? `<small class="text-muted">Source: ${article.source.name}</small>` : ''}
            ${article.author ? `<p class="text-muted">Author: ${article.author}</p>` : ''}
            ${article.publishedAt ? `<p class="text-muted">Published: ${new Date(article.publishedAt).toLocaleDateString()}</p>` : ''}
            ${article.description ? `<p>${article.description}</p>` : ''}
            <a href="${article.url}" target="_blank" class="btn btn-primary">Read More</a>
          </li>
        `;
      });
      newsContent += '</ul>';

      document.getElementById('newsContent').innerHTML = newsContent;
    }

    newsModal.show();
  }
});
