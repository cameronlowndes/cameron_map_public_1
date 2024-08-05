<?php
// fetchAirports.php

header('Content-Type: application/json');

// Suppress errors in the output
error_reporting(0);

// Get the country code from the query parameters
if (!isset($_GET['countryCode']) || empty($_GET['countryCode'])) {
    echo json_encode(['error' => 'No country code provided.']);
    exit;
}

$countryCode = urlencode($_GET['countryCode']);
$username = 'cameron_2321'; // GeoNames username
$baseUrl = "http://api.geonames.org/searchJSON?featureCode=AIRP&username=$username&maxRows=1000";

// Function to fetch bounding box for the country
function fetchBoundingBox($countryCode) {
    $boundingBoxUrl = "https://nominatim.openstreetmap.org/search.php?q=" . urlencode($countryCode) . "&format=json&limit=1";

    $response = @file_get_contents($boundingBoxUrl);
    if ($response === FALSE) {
        return ['error' => 'Error fetching bounding box data.'];
    }

    $data = json_decode($response, true);
    if (isset($data[0]['boundingbox'])) {
        return $data[0]['boundingbox']; // Return the bounding box array [south, north, west, east]
    } else {
        return ['error' => 'Bounding box not found.'];
    }
}

// Function to fetch airport data
function fetchAirports($startRow, $north, $south, $east, $west, $baseUrl) {
    $url = "$baseUrl&startRow=$startRow&north=$north&south=$south&east=$east&west=$west";

    $response = @file_get_contents($url);
    if ($response === FALSE) {
        return ['error' => 'Error fetching airport data.'];
    }

    return json_decode($response, true);
}

// Fetch bounding box
$boundingBox = fetchBoundingBox($countryCode);
if (isset($boundingBox['error'])) {
    echo json_encode($boundingBox);
    exit;
}

list($south, $north, $west, $east) = $boundingBox;

// Fetch airport data
$airports = fetchAirports(0, $north, $south, $east, $west, $baseUrl);
if (isset($airports['error'])) {
    echo json_encode($airports);
    exit;
}

echo json_encode($airports);
?>
