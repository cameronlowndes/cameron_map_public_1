<?php
header('Content-Type: application/json');

// API URL for exchange rates (adjust URL if your API key is needed)
$apiUrl = 'https://api.exchangerate-api.com/v4/latest/';

// Get the base currency from the request
$baseCurrency = isset($_GET['base']) ? $_GET['base'] : 'USD'; // Default to USD if not provided

// Construct the API URL
$url = $apiUrl . urlencode($baseCurrency);

try {
    // Initialize cURL session
    $ch = curl_init();

    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    // Execute cURL request and fetch the response
    $response = curl_exec($ch);

    // Check for cURL errors
    if (curl_errno($ch)) {
        echo json_encode(['error' => curl_error($ch)]);
        exit;
    }

    // Close cURL session
    curl_close($ch);

    // Decode the response
    $data = json_decode($response, true);

    // Check for errors in the API response
    if (isset($data['error'])) {
        echo json_encode(['error' => $data['error']]);
        exit;
    }

    // Return the exchange rates
    echo json_encode($data);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
