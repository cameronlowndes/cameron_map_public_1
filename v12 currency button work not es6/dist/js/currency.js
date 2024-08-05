document.addEventListener('DOMContentLoaded', function() {
  const currencyBtn = document.getElementById('currencyBtn');
  const convertCurrencyForm = document.getElementById('convertCurrencyForm');
  const resultContainer = document.getElementById('resultContainer');
  const currencySelect = document.getElementById('currencySelect');

  // Function to populate currency options
  async function populateCurrencyOptions() {
    try {
      const response = await fetch('php/fetch_currency.php?base=USD');
      const data = await response.json();

      if (data.error) {
        console.error('Error fetching currency options:', data.error);
        currencySelect.innerHTML = '<option value="">Error loading currencies</option>';
      } else {
        const options = Object.keys(data.rates).map(currencyCode => {
          return `<option value="${currencyCode}">${currencyCode}</option>`;
        }).join('');
        currencySelect.innerHTML = options;
      }
    } catch (error) {
      console.error('Error fetching currency options:', error.message);
      currencySelect.innerHTML = '<option value="">Error loading currencies</option>';
    }
  }

  // Function to perform currency conversion
  async function convertCurrency(amount, targetCurrency) {
    try {
      const response = await fetch(`php/fetch_currency.php?base=USD`);
      const data = await response.json();

      if (data.error) {
        console.error('Error fetching exchange rate:', data.error);
        resultContainer.innerHTML = '<p>Failed to fetch exchange rates. Please try again later.</p>';
      } else {
        const conversionRate = data.rates[targetCurrency];
        if (conversionRate) {
          const convertedAmount = amount * conversionRate;
          resultContainer.innerHTML = `<p>${amount} USD = ${convertedAmount.toFixed(2)} ${targetCurrency}</p>`;
        } else {
          resultContainer.innerHTML = `<p>Conversion rate for ${targetCurrency} not available</p>`;
        }
      }

      // Show currency modal
      const currencyModal = new bootstrap.Modal(document.getElementById('currencyModal'), {
        backdrop: 'static'
      });
      currencyModal.show();
    } catch (error) {
      console.error('Error performing currency conversion:', error.message);
      resultContainer.innerHTML = '<p>Failed to perform currency conversion. Please try again later.</p>';
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
      resultContainer.innerHTML = '<p>Please provide both amount and target currency.</p>';
    }
  });

  convertCurrencyForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form default submission
    const amount = document.getElementById('amount').value;
    const targetCurrency = currencySelect.value;

    if (amount && targetCurrency) {
      convertCurrency(amount, targetCurrency); // Call function to convert currency
    } else {
      resultContainer.innerHTML = '<p>Please provide both amount and target currency.</p>';
    }
  });

  // Populate currency options on page load
  populateCurrencyOptions();
});
