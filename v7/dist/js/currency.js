// currency.js

document.addEventListener('DOMContentLoaded', function() {
  const currencyBtn = document.getElementById('currencyBtn');
  const convertCurrencyForm = document.getElementById('convertCurrencyForm');
  const resultContainer = document.getElementById('resultContainer');
  const currencySelect = document.getElementById('currencySelect');

  // Function to populate currency options
  async function populateCurrencyOptions() {
    try {
      const { rates } = await fetchExchangeRates('USD'); // Fetch base USD rates
      const options = Object.keys(rates).map(currencyCode => {
        return `<option value="${currencyCode}">${currencyCode}</option>`;
      }).join('');
      currencySelect.innerHTML = options;
    } catch (error) {
      console.error('Error fetching currency options:', error.message);
      currencySelect.innerHTML = '<option value="">Error loading currencies</option>';
    }
  }

  // Function to perform currency conversion
  async function convertCurrency(amount, targetCurrency) {
    const baseCurrency = 'USD'; // Base currency is always USD

    try {
      const { rates } = await fetchExchangeRates(baseCurrency);

      // Check if the target currency is available in the rates
      if (rates[targetCurrency]) {
        const conversionRate = rates[targetCurrency];
        const convertedAmount = amount * conversionRate;
        resultContainer.innerHTML = `
          <p>${amount} ${baseCurrency} = ${convertedAmount.toFixed(2)} ${targetCurrency}</p>
        `;
      } else {
        resultContainer.innerHTML = `
          <p>Conversion rate for ${targetCurrency} not available</p>
        `;
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error.message);
      resultContainer.innerHTML = `
        <p>Failed to fetch exchange rates. Please try again later.</p>
      `;
    }

    // Show currency modal
    const currencyModal = new bootstrap.Modal(document.getElementById('currencyModal'), {
      backdrop: 'static'
    });
    currencyModal.show();
  }

  // Function to fetch exchange rates from an API
  async function fetchExchangeRates(baseCurrency) {
    const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching exchange rates:', error.message);
      throw error; // Rethrow error to be handled by caller
    }
  }

  // Initialize the modal and button
  currencyBtn.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default action if necessary
    const amount = document.getElementById('amount').value;
    const targetCurrency = currencySelect.value;

    if (amount && targetCurrency) {
      convertCurrency(amount, targetCurrency); // Call function to convert currency
    } else {
      resultContainer.innerHTML = `
        <p>Please provide both amount and target currency.</p>
      `;
    }
  });

  convertCurrencyForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form default submission
    const amount = document.getElementById('amount').value;
    const targetCurrency = currencySelect.value;

    if (amount && targetCurrency) {
      convertCurrency(amount, targetCurrency); // Call function to convert currency
    } else {
      resultContainer.innerHTML = `
        <p>Please provide both amount and target currency.</p>
      `;
    }
  });

  // Populate currency options on page load
  populateCurrencyOptions();
});
// Show currency modal