<?php
/**
 * Calendar Controller
 * Handles Jackrabbit calendar data fetching and parsing
 */

class CalendarController extends BaseController
{
    // Clean URL without query params as base
    private const JACKRABBIT_CALENDAR_URL = 'https://app.jackrabbitclass.com/eventcalendar.asp';
    private const ORG_ID = '514082';
    private const CACHE_DURATION = 300; // 5 minutes in seconds

    public function __construct($database)
    {
        parent::__construct($database);
    }

    /**
     * Get calendar data from Jackrabbit
     */
    public function index()
    {
        try {
            error_log("CalendarController::index() called");

            // Get query parameters
            $month = $_GET['month'] ?? null;
            $year = $_GET['year'] ?? null;
            $status = $_GET['status'] ?? '';

            // If we have a direct Month/Year request, we need to format it for the 'date' parameter
            // The ASP page expects 'date' parameter (e.g., 1/1/2026) to navigate
            $dateParam = null;
            if ($month && $year) {
                $dateParam = $month . '/1/' . $year;
            }

            // Build URL parameters
            $params = [
                'orgid' => self::ORG_ID
            ];

            if ($dateParam) {
                $params['date'] = $dateParam;
            }

            if (!empty($status)) {
                $params['status'] = $status;
            }

            $url = self::JACKRABBIT_CALENDAR_URL . '?' . http_build_query($params);

            error_log("Fetching calendar from: " . $url);

            // Fetch HTML
            $html = $this->fetchHtml($url);

            // Parse HTML  
            $calendarData = $this->parseCalendarHtml($html);

            // Log activity
            $this->logActivity('fetch_calendar', [
                'month' => $month,
                'year' => $year,
                'status' => $status,
                'url' => $url
            ]);

            ResponseHelper::json([
                'success' => true,
                'message' => 'Calendar retrieved successfully',
                'data' => $calendarData,
                'timestamp' => date('c')
            ]);

        } catch (Exception $e) {
            error_log("Calendar fetch error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to fetch calendar data: ' . $e->getMessage());
        }
    }

    /**
     * Fetch HTML from URL
     */
    private function fetchHtml($url)
    {
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30,
            // Use a standard browser User-Agent to avoid blocking
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_ENCODING => '', // Handle gzip/deflate automatically
            CURLOPT_HTTPHEADER => [
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language: en-US,en;q=0.5',
                'Connection: keep-alive',
                'Upgrade-Insecure-Requests: 1'
            ]
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        error_log("HTTP Code: " . $httpCode);
        error_log("Response length: " . strlen($response));

        if ($response === false || !empty($error)) {
            throw new Exception("HTTP request failed: " . $error);
        }

        if ($httpCode !== 200) {
            // Check for potential block page or maintenance
            throw new Exception("HTTP request returned status code: " . $httpCode);
        }

        return $response;
    }

    /**
     * Parse calendar HTML using DOMDocument and XPath
     */
    private function parseCalendarHtml($html)
    {
        error_log("Parsing HTML of length: " . strlen($html));

        // Suppress warnings for malformed HTML
        libxml_use_internal_errors(true);

        $dom = new DOMDocument();
        // Load HTML with fallback encoding ISO-8859-1 as simple pages often use it, 
        // or UTF-8 if specified via meta tags. DOMDocument handles basic detection.
        $dom->loadHTML($html);

        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        // 1. Extract Month and Year
        // The header is typically in a table cell: <b>Month Year</b>
        // Looking at the dump: <td align="center"><font size="2" face="Arial" xcolor="white"><b>December 2025</b></font></td>
        // More robust: search for the text in the specific header area.

        // Try to find the Month Year string. 
        // It sits in the navigation row: Previous Month | December 2025 | Next Month
        $monthYearNode = $xpath->query("//table[@class='MonthlyCal']//tr[1]//td[2]//b")->item(0);
        $monthYearStr = $monthYearNode ? trim($monthYearNode->textContent) : date('F Y');

        // Parse Month and Year
        $parts = explode(' ', $monthYearStr);
        $monthName = $parts[0] ?? date('F');
        $yearVal = isset($parts[1]) ? (int) $parts[1] : (int) date('Y');

        error_log("Parsed Month/Year: $monthName $yearVal");

        // 2. Extract Navigation URLs
        $prevUrl = '';
        $nextUrl = '';

        // The links usually contain "Previous Month" or "Next Month" text or similar arrows
        $navLinks = $xpath->query("//table[@class='MonthlyCal']//tr[1]//a");
        foreach ($navLinks as $link) {
            $text = $link->textContent;
            $href = $link->getAttribute('href');

            // Clean up href - it might be relative
            if (!empty($href) && strpos($href, 'http') === false) {
                $href = 'https://app.jackrabbitclass.com/' . ltrim($href, '/');
            }

            if (stripos($text, 'Previous') !== false || strpos($text, '<<') !== false) {
                $prevUrl = $href;
            } elseif (stripos($text, 'Next') !== false || strpos($text, '>>') !== false) {
                $nextUrl = $href;
            }
        }

        // 3. Extract Filters
        // <select name="CalendarDisplay"> ... <option>
        $filters = [];
        $options = $xpath->query("//select[@name='CalendarDisplay']//option");
        $currentFilter = '';

        foreach ($options as $option) {
            $val = $option->getAttribute('value');
            $label = trim($option->textContent);
            $selected = $option->hasAttribute('selected');

            if ($selected) {
                $currentFilter = $val;
            }

            $filters[] = [
                'type' => $val,
                'label' => $label
            ];
        }

        // 4. Parse Calendar Grid
        // Structure: <table class="MonthlyCal"> -> <tr> (header) -> <tr> (days of week) -> <tr> (week 1) ...
        // We skip the first 2 rows (header + day names)

        $calendarWeeks = [];
        $rows = $xpath->query("//table[@class='MonthlyCal']//tr");

        // Start from row index 2 (0-based) to skip header and day names
        // But double check row structure via class or content if possible.
        // The day rows usually contain td with class 'MonthlyCal_InMonth', 'MonthlyCal_NotInMonth', or 'MonthlyCal_Today'

        $rowIndex = 0;
        foreach ($rows as $row) {
            $rowIndex++;

            // Heuristic: Check if this row looks like a week row
            // It should have tds with height attributes or specific classes
            $cols = $xpath->query(".//td[contains(@class, 'MonthlyCal_')]", $row);

            if ($cols->length > 0) {
                $days = [];
                foreach ($cols as $col) {
                    $class = $col->getAttribute('class');

                    // Determine status
                    $isInMonth = strpos($class, 'MonthlyCal_InMonth') !== false || strpos($class, 'MonthlyCal_Today') !== false;
                    $isToday = strpos($class, 'MonthlyCal_Today') !== false;

                    // Extract Date Number
                    // Usually <small>1</small>
                    $dateNumNode = $xpath->query(".//small", $col)->item(0);
                    $dayNum = $dateNumNode ? (int) trim($dateNumNode->textContent) : 0;

                    // If no dayNum found (empty NotInMonth cell?), skip or mark empty
                    if ($dayNum === 0 && !$isInMonth) {
                        // Try to infer day or just mark as padding
                        $days[] = [
                            'date' => '',
                            'day' => 0,
                            'isInMonth' => false,
                            'isToday' => false,
                            'events' => []
                        ];
                        continue;
                    }

                    // Calculate full date string YYYY-MM-DD
                    // Logic: If we know the Month/Year, we can form the date.
                    // CAUTION: NotInMonth cells might belong to prev/next month. 
                    // Simple logic: if InMonth, use current Month/Year.

                    // NOTE: The previous code tried to guess padding days. 
                    // Ideally we should track if we are in previous or next month buffer.
                    // However, for display purposes, we might just need the dayNum.
                    // Let's assume InMonth is strict.

                    $fullDate = '';
                    if ($isInMonth) {
                        $fullDate = sprintf('%04d-%02d-%02d', $yearVal, date('m', strtotime($monthName)), $dayNum);
                    }

                    // Extract Events
                    // <a onclick="openreg(123)...">Event Title</a>
                    $events = [];
                    $eventLinks = $xpath->query(".//a[contains(@onclick, 'openreg')]", $col);

                    foreach ($eventLinks as $link) {
                        $bgNode = $link->parentNode; // <td> inside the nested table
                        $bgColor = $bgNode->getAttribute('bgcolor') ?: '#FFFFFF';

                        // Extract ID from onclick
                        $onclick = $link->getAttribute('onclick');
                        preg_match('/openreg\((\d+)\)/', $onclick, $matches);
                        $eventId = $matches[1] ?? uniqid();

                        $rawTitle = trim($link->textContent);

                        // Extract Time: "10:00a Event Title"
                        // Or via the 'sort' attribute on the TD: <td sort="<!--10:00-->">
                        // The HTML dump shows: <td oheight="16" sort="<!--10:00-->" bgcolor="#0099CC">

                        $eventTime = '';
                        $cleanTitle = $rawTitle;

                        // Try to regex time from title if not found otherwise
                        if (preg_match('/^(\d{1,2}:\d{2}[ap])\s+(.*)$/i', $rawTitle, $tMatch)) {
                            $eventTime = $tMatch[1];
                            $cleanTitle = trim($tMatch[2]);
                        } elseif (preg_match('/^<b>(\d{1,2}:\d{2}[ap])<\/b>\s*(.*)$/i', $link->ownerDocument->saveHTML($link), $tMatchHtml)) {
                            // Sometimes title is <b>10:00a</b> Title
                            $eventTime = $tMatchHtml[1];
                            $cleanTitle = strip_tags($tMatchHtml[2]);
                        }

                        // Spots: "(3)" at end
                        $spots = 0;
                        if (preg_match('/\((\d+)\)$/', $cleanTitle, $sMatch)) {
                            $spots = (int) $sMatch[1];
                            $cleanTitle = trim(substr($cleanTitle, 0, strrpos($cleanTitle, '(')));
                        }

                        $events[] = [
                            'id' => $eventId,
                            'title' => $cleanTitle, // Clean title without time/spots
                            'fullTitle' => $rawTitle, // Original text for reference
                            'time' => $eventTime,
                            'spotsAvailable' => $spots,
                            'backgroundColor' => $bgColor,
                            'registrationUrl' => "https://app.jackrabbitclass.com/regevent.asp?xID={$eventId}&orgid=" . self::ORG_ID . "&PortalSession="
                        ];
                    }

                    $days[] = [
                        'date' => $fullDate,
                        'day' => $dayNum,
                        'isInMonth' => $isInMonth,
                        'isToday' => $isToday,
                        'events' => $events
                    ];
                }

                if (!empty($days)) {
                    $calendarWeeks[] = ['days' => $days];
                }
            }
        }

        return [
            'calendar' => [
                'month' => $monthName,
                'year' => $yearVal,
                'weeks' => $calendarWeeks,
                'previousMonthUrl' => $prevUrl,
                'nextMonthUrl' => $nextUrl
            ],
            'filters' => $filters,
            'currentFilter' => $currentFilter
        ];
    }

    /**
     * Get camps and clinics from calendar data
     * Fetches multiple months and filters for CAMP/CLINIC events
     */
    public function campsAndClinics()
    {
        try {
            // Get how many months to look ahead (default 3)
            $monthsAhead = min(6, max(1, intval($_GET['months'] ?? 3)));

            $seenEvents = []; // Track by event ID to avoid duplicates

            // Fetch current month and next N months
            $currentDate = new DateTime();

            for ($i = 0; $i < $monthsAhead; $i++) {
                $targetDate = clone $currentDate;
                $targetDate->modify("+{$i} months");

                $month = $targetDate->format('n'); // 1-12
                $year = $targetDate->format('Y');

                // Build URL
                $params = [
                    'orgid' => self::ORG_ID,
                    'date' => $month . '/1/' . $year
                ];

                $url = self::JACKRABBIT_CALENDAR_URL . '?' . http_build_query($params);

                try {
                    $html = $this->fetchHtml($url);
                    $calendarData = $this->parseCalendarHtml($html);

                    // Extract camps and clinics from this month
                    foreach ($calendarData['calendar']['weeks'] as $week) {
                        foreach ($week['days'] as $day) {
                            if (empty($day['events']) || !$day['isInMonth']) {
                                continue;
                            }

                            foreach ($day['events'] as $event) {
                                $title = strtoupper($event['title']);

                                // Check if it's a camp or clinic
                                if (strpos($title, 'CAMP') !== false || strpos($title, 'CLINIC') !== false) {
                                    $eventId = $event['id'];

                                    // Track unique events but collect all dates
                                    if (!isset($seenEvents[$eventId])) {
                                        $seenEvents[$eventId] = [
                                            'id' => $event['id'],
                                            'title' => $event['title'],
                                            'time' => $event['time'],
                                            'spotsAvailable' => $event['spotsAvailable'],
                                            'backgroundColor' => $event['backgroundColor'],
                                            'registrationUrl' => $event['registrationUrl'],
                                            'dates' => [],
                                            'type' => strpos($title, 'CAMP') !== false ? 'camp' : 'clinic'
                                        ];
                                    }

                                    // Add this date
                                    if (!empty($day['date']) && !in_array($day['date'], $seenEvents[$eventId]['dates'])) {
                                        $seenEvents[$eventId]['dates'][] = $day['date'];
                                    }

                                    // Update spots (use latest/lowest)
                                    $seenEvents[$eventId]['spotsAvailable'] = min(
                                        $seenEvents[$eventId]['spotsAvailable'] ?: PHP_INT_MAX,
                                        $event['spotsAvailable']
                                    );
                                }
                            }
                        }
                    }
                } catch (Exception $e) {
                    error_log("Failed to fetch month {$month}/{$year}: " . $e->getMessage());
                    // Continue to next month even if one fails
                }
            }

            // Convert to array and sort by first date
            $events = array_values($seenEvents);
            usort($events, function($a, $b) {
                $dateA = !empty($a['dates']) ? $a['dates'][0] : '9999-99-99';
                $dateB = !empty($b['dates']) ? $b['dates'][0] : '9999-99-99';
                return strcmp($dateA, $dateB);
            });

            // Format dates nicely for display
            foreach ($events as &$event) {
                sort($event['dates']);
                $event['dateRange'] = $this->formatDateRange($event['dates']);
                $event['firstDate'] = !empty($event['dates']) ? $event['dates'][0] : null;
            }

            // Separate camps and clinics
            $camps = array_values(array_filter($events, fn($e) => $e['type'] === 'camp'));
            $clinics = array_values(array_filter($events, fn($e) => $e['type'] === 'clinic'));

            ResponseHelper::success([
                'camps' => $camps,
                'clinics' => $clinics,
                'all' => $events,
                'monthsSearched' => $monthsAhead
            ], 'Camps and clinics retrieved successfully');

        } catch (Exception $e) {
            error_log("Camps/Clinics fetch error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to fetch camps and clinics: ' . $e->getMessage());
        }
    }

    /**
     * Format an array of dates into a human-readable range
     */
    private function formatDateRange(array $dates): string
    {
        if (empty($dates)) {
            return '';
        }

        if (count($dates) === 1) {
            return date('M j, Y', strtotime($dates[0]));
        }

        // Check if dates are consecutive
        $first = $dates[0];
        $last = end($dates);

        $firstDate = new DateTime($first);
        $lastDate = new DateTime($last);

        // If same month
        if ($firstDate->format('F Y') === $lastDate->format('F Y')) {
            return $firstDate->format('M j') . '-' . $lastDate->format('j, Y');
        }

        // Different months
        return $firstDate->format('M j') . ' - ' . $lastDate->format('M j, Y');
    }
}