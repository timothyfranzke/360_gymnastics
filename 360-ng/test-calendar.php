<?php
// Simple test script to debug calendar API
error_reporting(E_ALL);
ini_set('display_errors', 1);

$url = 'https://app.jackrabbitclass.com/eventcalendar.asp?orgid=514082';

echo "Testing calendar fetch from: " . $url . "\n\n";

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; 360Gym-Calendar-Test/1.0)',
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_ENCODING => '',
    CURLOPT_HTTPHEADER => [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.5'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
echo "Response length: " . strlen($response) . "\n";
echo "Curl error: " . $error . "\n\n";

if ($httpCode === 200 && !empty($response)) {
    echo "First 1000 characters of response:\n";
    echo substr($response, 0, 1000) . "\n\n";
    
    // Look for month/year
    if (preg_match('/<b>([A-Za-z]+ \d{4})<\/b>/', $response, $matches)) {
        echo "Found month/year: " . $matches[1] . "\n";
    } else {
        echo "Could not find month/year pattern\n";
    }
    
    // Look for events
    if (preg_match_all('/<a[^>]*onclick="openreg\((\d+)\)[^"]*"[^>]*>([^<]*)<\/a>/s', $response, $matches, PREG_SET_ORDER)) {
        echo "Found " . count($matches) . " events:\n";
        foreach (array_slice($matches, 0, 5) as $i => $match) {
            echo "  Event " . ($i+1) . ": ID=" . $match[1] . ", Text=" . trim($match[2]) . "\n";
        }
    } else {
        echo "No events found\n";
    }
    
    // Look for calendar table
    if (preg_match('/<table[^>]*class="MonthlyCal"[^>]*>/', $response)) {
        echo "Found MonthlyCal table\n";
    } else {
        echo "No MonthlyCal table found\n";
    }
    
} else {
    echo "Failed to fetch calendar\n";
}
?>