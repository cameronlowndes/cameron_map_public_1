<?php
// fetch_news.php

header('Content-Type: application/json');

$api_key = '767e84c8742e4d61befb57bfe1905465'; // Your NewsAPI key
$country_code = isset($_GET['country']) ? $_GET['country'] : 'us'; // Default to 'us' if no country is provided

// NewsAPI endpoint
$api_url = "https://newsapi.org/v2/top-headlines?country=$country_code&apiKey=$api_key";

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// Set the User-Agent header
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'User-Agent: MyNewsApp/1.0' // Replace with your app name and version
));

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
echo $response;
?>
