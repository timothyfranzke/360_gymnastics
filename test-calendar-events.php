<?php
// Test script to see all events
error_reporting(E_ALL);
ini_set('display_errors', 1);

$url = 'https://app.jackrabbitclass.com/eventcalendar.asp?orgid=514082';

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
curl_close($ch);

if (preg_match_all('/<a[^>]*onclick="openreg\((\d+)\)[^"]*"[^>]*>([^<]*)<\/a>/s', $response, $matches, PREG_SET_ORDER)) {
    echo "Found " . count($matches) . " events:\n\n";
    
    foreach ($matches as $i => $match) {
        $eventId = $match[1];
        $eventText = trim($match[2]);
        
        // Parse event details
        $time = '';
        $spots = 0;
        $title = $eventText;
        
        // Extract time
        if (preg_match('/(\d{1,2}:\d{2}[ap])/i', $eventText, $timeMatch)) {
            $time = $timeMatch[1];
            $title = trim(str_replace($timeMatch[0], '', $title));
        }
        
        // Extract spots
        if (preg_match('/\((\d+)\)/', $eventText, $spotsMatch)) {
            $spots = (int)$spotsMatch[1];
            $title = trim(str_replace($spotsMatch[0], '', $title));
        }
        
        // Clean title
        $title = trim($title, ' -');
        
        echo "Event " . ($i+1) . ":\n";
        echo "  ID: " . $eventId . "\n";
        echo "  Raw Text: " . $eventText . "\n";
        echo "  Title: " . $title . "\n";
        echo "  Time: " . $time . "\n";
        echo "  Spots: " . $spots . "\n";
        echo "  Registration URL: https://app.jackrabbitclass.com/regevent.asp?xID=" . $eventId . "&orgid=514082&PortalSession=\n\n";
    }
} else {
    echo "No events found\n";
}
?>