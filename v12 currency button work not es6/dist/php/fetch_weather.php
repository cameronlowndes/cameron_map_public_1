<?php
$apiKey = 'af080b90f16545a0882122240231404'; 
$action = $_GET['action'] ?? '';
$location = $_GET['location'] ?? '';
$lat = $_GET['lat'] ?? '';
$lon = $_GET['lon'] ?? '';

if ($action == 'current' && !empty($location)) {
    $endpoint = "https://api.weatherapi.com/v1/current.json?key=$apiKey&q=" . urlencode($location) . "&aqi=no";
} elseif ($action == 'forecast' && !empty($lat) && !empty($lon)) {
    $endpoint = "https://api.weatherapi.com/v1/forecast.json?key=$apiKey&q=$lat,$lon&days=3&aqi=no&alerts=no";
} else {
    echo json_encode(['error' => 'Invalid request parameters']);
    exit;
}

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// Execute cURL request and fetch the response
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
    exit;
}

// Close cURL session
curl_close($ch);

// Output the response
header('Content-Type: application/json');
echo $response;
?>
