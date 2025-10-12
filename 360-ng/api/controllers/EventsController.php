function extract_jackrabbit_events_to_json(string $html_content): string
{
    $events = [];

    // 1. Extract the current Month and Year from the table header
    if (!preg_match('/<b>(.*?) (\d{4})<\/b>/s', $html_content, $month_year_matches)) {
        return json_encode(['error' => 'Could not determine calendar month and year.'], JSON_PRETTY_PRINT);
    }
    $month_name = $month_year_matches[1];
    $year = (int)$month_year_matches[2];
    $month = date('n', strtotime($month_name)); // Convert month name to number (1-12)

    // Regex to find all table cells that contain a day number AND events.
    // We look for <td> with class MonthlyCal_InMonth or MonthlyCal_Today,
    // which wraps an inner <table>, which contains the day number (<small>X</small>)
    // and the event rows (<tr><td oheight...)
    // The 's' modifier allows '.' to match newlines.
    $day_cell_regex = '/<td[^>]*class="MonthlyCal_(InMonth|Today)"[^>]*>(.*?)<\/td>/s';

    if (preg_match_all($day_cell_regex, $html_content, $day_matches)) {
        
        foreach ($day_matches[2] as $cell_content) {
            
            // Extract the day number from the cell content: <small>X</small>
            if (!preg_match('/<small>(\d{1,2})<\/small>/', $cell_content, $day_match)) {
                // Skip if no day number is found (e.g., if the cell only contains a <p> tag or is empty)
                continue; 
            }
            $day = (int)$day_match[1];
            
            // Create the full date string
            $date_str = sprintf('%d-%02d-%02d', $year, $month, $day);

            // Regex to find all event rows within the day cell.
            // This targets the <tr><td oheight="16" ...>...</td></tr>
            // The event link contains the ID (openreg(ID)) and the event title.
            $event_regex = '/<td oheight="16" sort="" bgcolor="#([0-9A-F]{6})"><a href="#" onclick="openreg\((\d+)\);.*?"><b>(.*?)<\/b> (.*?)<\/a><\/td>/s';

            if (preg_match_all($event_regex, $cell_content, $event_matches, PREG_SET_ORDER)) {
                
                foreach ($event_matches as $match) {
                    
                    // $match[4] is the bold time (e.g., "2:00p")
                    // $match[5] is the event details (e.g., "Open Gym (60)")
                    
                    $full_event_title = trim($match[5]);
                    
                    // Extract event name and capacity/openings from the title (e.g., "Open Gym (60)")
                    $name = $full_event_title;
                    $openings = 0;
                    if (preg_match('/^(.*?)\s+\((\d+)\)$/', $full_event_title, $title_parts)) {
                        $name = trim($title_parts[1]);
                        $openings = (int)$title_parts[2];
                    }
                    
                    $events[] = [
                        'date' => $date_str,
                        'time' => trim($match[4]),
                        'event_id' => (int)$match[3],
                        'name' => $name,
                        'openings' => $openings,
                        'bg_color' => '#' . $match[2], // e.g., #00CC00
                        'sort_time_24h' => trim($match[1]), // e.g., 'register_url' => "https://app.jackrabbitclass.com/regevent.asp?xID=" . $match[3] . "&orgid=514082&PortalSession=", // Reconstruct URL
                    ];
                }
            }
        }
    }

    return json_encode($events, JSON_PRETTY_PRINT);
}