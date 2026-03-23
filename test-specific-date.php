<?php
// Test specific dates to find events
error_reporting(E_ALL);
ini_set('display_errors', 1);

$dates = [
    'current' => 'https://app.jackrabbitclass.com/eventcalendar.asp?orgid=514082',
    'december' => 'https://app.jackrabbitclass.com/eventcalendar.asp?orgid=514082&date=12/1/2025',
    'january' => 'https://app.jackrabbitclass.com/eventcalendar.asp?orgid=514082&date=1/1/2026'
];

foreach ($dates as $label => $url) {
    echo "=== Testing $label ===\n";
    echo "URL: $url\n";
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'Mozilla/5.0',
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    echo "Response Length: " . strlen($response) . "\n";
    
    // Look for month/year
    if (preg_match('/<b>([A-Za-z]+ \d{4})<\/b>/', $response, $matches)) {
        echo "Month/Year: " . $matches[1] . "\n";
    }
    
    // Count different types of events
    if (preg_match_all('/<a[^>]*onclick="openreg\((\d+)\)[^"]*"[^>]*>([^<]*)<\/a>/s', $response, $matches, PREG_SET_ORDER)) {
        $eventTypes = [];
        foreach ($matches as $match) {
            $text = trim($match[2]);
            if (stripos($text, 'open gym') !== false) {
                $eventTypes['Open Gym'][] = $text;
            } elseif (stripos($text, 'closed') !== false) {
                $eventTypes['Closed'][] = $text;
            } elseif (stripos($text, 'camp') !== false) {
                $eventTypes['Camp'][] = $text;
            } elseif (stripos($text, 'clinic') !== false) {
                $eventTypes['Clinic'][] = $text;
            } else {
                $eventTypes['Other'][] = $text;
            }
        }
        
        foreach ($eventTypes as $type => $events) {
            echo "$type: " . count($events) . " events\n";
            if ($type !== 'Closed' && count($events) > 0) {
                echo "  Sample: " . $events[0] . "\n";
            }
        }
    }
    
    echo "\n";
}
?>