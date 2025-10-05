<?php
/**
 * Jackrabbit Controller
 * Handles Jackrabbit schedule data fetching and parsing
 */

class JackrabbitController extends BaseController {
    // Based on proxy.config.json, the correct URL is the base domain + /Openings.asp
    private const JACKRABBIT_URL = 'https://app.jackrabbitclass.com/Openings.asp';
    private const JACKRABBIT_ID = '514082';
    private const CACHE_DURATION = 300; // 5 minutes in seconds
    
    public function __construct($database) {
        parent::__construct($database);
    }
    
    /**
     * Get class schedule from Jackrabbit
     */
    public function schedule() {
        try {
            error_log("JackrabbitController::schedule() called");
            
            // Validate input
            $input = $this->getInput();
            error_log("Input received: " . json_encode($input));
            
            // Validate cat1 parameter
            if (!isset($input['cat1']) || empty(trim($input['cat1']))) {
                error_log("Missing cat1 parameter");
                ResponseHelper::validationError(['cat1' => 'Category parameter (cat1) is required']);
                return;
            }
            
            $cat1 = trim($input['cat1']);
            
            // Sanitize the cat1 parameter to prevent injection
            if (!$this->isValidCategory($cat1)) {
                ResponseHelper::validationError(['cat1' => 'Invalid category parameter']);
                return;
            }
            
            // Check cache first (temporarily disabled for debugging)
            $cacheKey = "jackrabbit_schedule_" . md5($cat1);
            
            // Clear cache for debugging - remove this line once working
            $this->clearCache($cacheKey);
            
            // $cachedData = $this->getCache($cacheKey);
            $cachedData = null;
            if ($cachedData !== null) {
                ResponseHelper::json([
                    'success' => true,
                    'message' => 'Schedule retrieved from cache',
                    'data' => $cachedData,
                    'timestamp' => date('c')
                ], 200, [
                    'Cache-Control' => 'public, max-age=' . self::CACHE_DURATION,
                    'X-Cache-Status' => 'HIT'
                ]);
                return;
            }
            
            // Fetch data from Jackrabbit
            $scheduleData = $this->fetchJackrabbitSchedule($cat1);
            
            // Cache the result
            $this->setCache($cacheKey, $scheduleData, self::CACHE_DURATION);
            
            // Log activity
            $this->logActivity('fetch_schedule', ['category' => $cat1, 'count' => count($scheduleData)]);
            
            ResponseHelper::json([
                'success' => true,
                'message' => 'Schedule retrieved successfully',
                'data' => $scheduleData,
                'timestamp' => date('c')
            ], 200, [
                'Cache-Control' => 'public, max-age=' . self::CACHE_DURATION,
                'X-Cache-Status' => 'MISS'
            ]);
            
        } catch (Exception $e) {
            error_log("Jackrabbit schedule fetch error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to fetch schedule data');
        }
    }
    
    /**
     * Fetch schedule data from Jackrabbit
     */
    private function fetchJackrabbitSchedule($cat1) {
        // Build URL with parameters (matching the original Angular proxy setup)
        $url = self::JACKRABBIT_URL . '?' . http_build_query([
            'id' => self::JACKRABBIT_ID,
            'Cat1' => $cat1,
            'sortcols' => 'Day',
            'hidecols' => 'Class Ends,Class Starts,Class Starts,Description,Session'
        ]);
        
        error_log("Fetching from URL: " . $url);
        
        // Initialize cURL
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; 360Gym-API/1.0)',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            
            // ⭐ CRITICAL FIX: Tell cURL to decode the response based on the
            // Accept-Encoding header (gzip, deflate) that is also set.
            CURLOPT_ENCODING => '', 
            
            CURLOPT_HTTPHEADER => [
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language: en-US,en;q=0.5',
                'Accept-Encoding: gzip, deflate', // This is what triggers the server to compress
                'Connection: keep-alive',
                'Cache-Control: no-cache'
            ]
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        curl_close($ch);
        
        error_log("HTTP Code: " . $httpCode);
        error_log("cURL Error: " . $error);
        error_log("Response length: " . strlen($response));
        error_log("Response: " . $response);
        
        if ($response === false || !empty($error)) {
            throw new Exception("HTTP request failed: " . $error);
        }
        
        if ($httpCode !== 200) {
            throw new Exception("HTTP request returned status code: " . $httpCode);
        }
        
        if (empty($response)) {
            throw new Exception("Empty response from Jackrabbit");
        }
        
        // Parse the HTML response
        return $this->parseJackrabbitResponse($response);
    }
    
    /**
     * Parse HTML response from Jackrabbit
     */
    private function parseJackrabbitResponse($response) {
        // Extract HTML from JavaScript document.write() calls
        $html = $this->extractHtmlFromJavaScript($response);
        
        if (empty($html)) {
            error_log("No HTML found in JavaScript response");
            return [];
        }
        
        error_log("Extracted HTML length: " . strlen($html));
        
        // Extract table rows with class="openings"
        preg_match_all('/<tr class="openings"[^>]*>(.*?)<\/tr>/s', $html, $matches);
        
        if (empty($matches[1])) {
            error_log("No table rows found with class='openings'");
            return [];
        }
        
        error_log("Found " . count($matches[1]) . " table rows");
        
        $rows = $matches[1];
        $tableData = [];
        
        foreach ($rows as $index => $row) {
            // Skip header row (first row)
            if ($index === 0) {
                continue;
            }
            
            // Extract all td elements from the row
            preg_match_all('/<td[^>]*>(.*?)<\/td>/s', $row, $cellMatches);
            
            if (empty($cellMatches[1])) {
                error_log("No cells found in row");
                continue;
            }
            
            $cells = $cellMatches[1];
            error_log("Row has " . count($cells) . " cells");
            
            // Based on the HTML structure you provided:
            // Cell 0: ID (hidden)
            // Cell 1: Description (hidden)  
            // Cell 2: Register button
            // Cell 3: Class name
            // Cell 4: Day
            // Cell 5: Time
            // Cell 6: Gender
            // Cell 7: Ages
            // Cell 8: Openings
            // Cell 9: Tuition (with class="amt")
            
            if (count($cells) < 10) {
                error_log("Not enough cells in row: " . count($cells));
                continue;
            }
            
            // Parse registration button info
            $registrationButton = $this->extractButtonInfo($cells[2]);
            
            $rowData = [
                'id' => $this->extractTextContent($cells[0]),
                'className' => $this->extractTextContent($cells[3]),
                'day' => $this->extractTextContent($cells[4]),
                'time' => $this->extractTextContent($cells[5]),
                'gender' => $this->extractTextContent($cells[6]),
                'ages' => $this->extractTextContent($cells[7]),
                'openings' => intval($this->extractTextContent($cells[8])) ?: 0,
                'tuition' => floatval($this->extractTextContent($cells[9])) ?: 0.0,
                'registrationButton' => $registrationButton
            ];
            
            error_log("Parsed row: " . json_encode($rowData));
            
            $tableData[] = $rowData;
        }
        
        // Sort by day and time
        return $this->sortScheduleData($tableData);
    }
    
    /**
     * Extract HTML content from JavaScript document.write() calls
     */
    /**
     * Extract HTML content from JavaScript document.write() calls
     */
    private function extractHtmlFromJavaScript($jsResponse) {
        error_log("Raw response first 500 chars: " . substr($jsResponse, 0, 500));
        
        // --- FIX IS HERE ---
        // Match document.write() calls. The 's' modifier allows '.' to match newlines.
        // We're expecting either single or double quotes for the content.
        preg_match_all('/document\.write\(\s*([\'"])(.*?)\1\s*\);/s', $jsResponse, $matches);
        // --- END OF FIX ---
        
        if (empty($matches[2])) {
            error_log("No document.write() calls found in response");
            error_log("Response length: " . strlen($jsResponse));
            return ''; // Stop trying alternative regex patterns; the main one should work.
        }
        
        error_log("Found " . count($matches[2]) . " document.write() calls");
        
        $htmlContent = '';
        foreach ($matches[2] as $index => $htmlChunk) {
            error_log("Processing chunk " . ($index + 1) . ", length: " . strlen($htmlChunk));
            
            // Unescape the HTML content.
            // The content is JS string-escaped (e.g., \" for quotes, \r\n for newlines).
            // Stripslash handles the common escapes like \\, \", \', \n, \r, \t, etc.
            $htmlChunk = stripslashes($htmlChunk); 
            
            // Also, remove extraneous carriage returns that might be in the original JS.
            $htmlChunk = str_replace("\r", '', $htmlChunk);
            
            $htmlContent .= $htmlChunk;
        }
        
        error_log("Final HTML content length: " . strlen($htmlContent));
        
        return $htmlContent;
    }
    
    /**
     * Extract text content from HTML, removing tags
     */
    private function extractTextContent($html) {
        $text = preg_replace('/<[^>]*>/', '', $html);
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text);
    }
    
    /**
     * Extract button information (text and href)
     */
    private function extractButtonInfo($html) {
        $buttonInfo = [
            'text' => null,
            'href' => null
        ];
        
        // Extract href
        if (preg_match('/href="([^"]+)"/', $html, $hrefMatch)) {
            $buttonInfo['href'] = $hrefMatch[1];
        }
        
        // Extract button text
        if (preg_match('/<a[^>]*>(.*?)<\/a>/', $html, $textMatch)) {
            $buttonInfo['text'] = trim($textMatch[1]);
        }
        
        return $buttonInfo;
    }
    
    /**
     * Sort schedule data by day and time
     */
    private function sortScheduleData($data) {
        $dayOrder = [
            'Sun' => 0,
            'Mon' => 1,
            'Tue' => 2,
            'Wed' => 3,
            'Thu' => 4,
            'Fri' => 5,
            'Sat' => 6
        ];
        
        usort($data, function($a, $b) use ($dayOrder) {
            $dayA = isset($dayOrder[$a['day']]) ? $dayOrder[$a['day']] : 999;
            $dayB = isset($dayOrder[$b['day']]) ? $dayOrder[$b['day']] : 999;
            
            if ($dayA !== $dayB) {
                return $dayA - $dayB;
            }
            
            // If same day, sort by time
            return $this->parseTimeToMinutes($a['time']) - $this->parseTimeToMinutes($b['time']);
        });
        
        return $data;
    }
    
    /**
     * Parse time string to minutes for comparison
     */
    private function parseTimeToMinutes($timeStr) {
        if (empty($timeStr)) {
            return 0;
        }
        
        // Extract hours, minutes, and AM/PM
        if (!preg_match('/(\d+):(\d+)\s*(AM|PM)/i', $timeStr, $match)) {
            return 0;
        }
        
        $hours = intval($match[1]);
        $minutes = intval($match[2]);
        $isPM = strtoupper($match[3]) === 'PM';
        
        // Convert to 24-hour format for easier comparison
        if ($isPM && $hours < 12) {
            $hours += 12;
        }
        if (!$isPM && $hours === 12) {
            $hours = 0;
        }
        
        return $hours * 60 + $minutes;
    }
    
    /**
     * Validate category parameter
     */
    private function isValidCategory($cat1) {
        // Allow alphanumeric characters, spaces, hyphens, and underscores
        return preg_match('/^[a-zA-Z0-9\s\-_]+$/', $cat1) && strlen($cat1) <= 100;
    }
    
    /**
     * Get cached data
     */
    private function getCache($key) {
        $cacheFile = __DIR__ . '/../cache/' . $key . '.cache';
        
        if (!file_exists($cacheFile)) {
            return null;
        }
        
        $cacheData = file_get_contents($cacheFile);
        $cache = json_decode($cacheData, true);
        
        if (!$cache || !isset($cache['expires']) || $cache['expires'] < time()) {
            // Cache expired, remove file
            @unlink($cacheFile);
            return null;
        }
        
        return $cache['data'];
    }
    
    /**
     * Set cache data
     */
    private function setCache($key, $data, $duration) {
        $cacheDir = __DIR__ . '/../cache';
        
        // Create cache directory if it doesn't exist
        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0755, true);
        }
        
        $cacheFile = $cacheDir . '/' . $key . '.cache';
        $cache = [
            'data' => $data,
            'expires' => time() + $duration
        ];
        
        file_put_contents($cacheFile, json_encode($cache));
    }
    
    /**
     * Clear specific cache entry
     */
    private function clearCache($key) {
        $cacheFile = __DIR__ . '/../cache/' . $key . '.cache';
        if (file_exists($cacheFile)) {
            @unlink($cacheFile);
            error_log("Cache cleared for key: " . $key);
        }
    }
}