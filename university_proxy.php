<?php
// university_proxy.php
// Proxies requests to the Hipolabs Universities API (http-only, blocked by browsers
// on HTTPS pages due to mixed-content rules). The server-side fetch is not subject
// to browser CORS or mixed-content restrictions.
// Usage: university_proxy.php?country=Lithuania

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$country = trim($_GET['country'] ?? '');

if ($country === '') {
    http_response_code(400);
    exit(json_encode(['error' => 'country parameter is required']));
}

// Build the upstream URL
$url = 'http://universities.hipolabs.com/search?country=' . urlencode($country);

// Use cURL for reliable server-side HTTP
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_USERAGENT, 'GlobePlanner/1.0');
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpCode !== 200) {
    http_response_code(502);
    exit(json_encode(['error' => 'Could not reach universities API', 'upstream_status' => $httpCode]));
}

// Return the upstream JSON response directly to the browser
echo $response;
?>
