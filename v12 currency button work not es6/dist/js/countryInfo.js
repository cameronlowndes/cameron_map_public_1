// country.js

// Function to open the modal and display country information
export function openModal(countryName, type) {
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
