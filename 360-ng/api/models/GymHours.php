<?php
/**
 * Gym Hours Model
 * Handles gym operating hours data operations
 */

class GymHours {
    private $db;
    private $validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get all gym hours
     */
    public function getAll() {
        $sql = "SELECT * FROM gym_hours WHERE is_active = 1 ORDER BY 
                FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')";
        
        $stmt = $this->db->execute($sql);
        return $stmt->fetchAll();
    }

    /**
     * Get hours for specific day
     */
    public function getByDay($day) {
        if (!in_array(strtolower($day), $this->validDays)) {
            throw new Exception('Invalid day of week');
        }

        $sql = "SELECT * FROM gym_hours WHERE day_of_week = ? AND is_active = 1";
        $stmt = $this->db->execute($sql, [strtolower($day)]);
        return $stmt->fetch();
    }

    /**
     * Update hours for specific day
     */
    public function updateDay($day, $data) {
        if (!in_array(strtolower($day), $this->validDays)) {
            throw new Exception('Invalid day of week');
        }

        try {
            $this->db->beginTransaction();

            // Check if record exists
            $existing = $this->getByDay($day);
            
            if ($existing) {
                // Update existing record
                $fields = [];
                $values = [];
                
                if (isset($data['open_time'])) {
                    $fields[] = "open_time = ?";
                    $values[] = $data['open_time'];
                }
                
                if (isset($data['close_time'])) {
                    $fields[] = "close_time = ?";
                    $values[] = $data['close_time'];
                }
                
                if (isset($data['is_closed'])) {
                    $fields[] = "is_closed = ?";
                    $values[] = $data['is_closed'] ? 1 : 0;
                }
                
                if (empty($fields)) {
                    throw new Exception('No valid fields to update');
                }
                
                $values[] = strtolower($day);
                $sql = "UPDATE gym_hours SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP 
                        WHERE day_of_week = ?";
                
                $this->db->execute($sql, $values);
                
            } else {
                // Create new record
                $sql = "INSERT INTO gym_hours (day_of_week, open_time, close_time, is_closed) VALUES (?, ?, ?, ?)";
                $this->db->execute($sql, [
                    strtolower($day),
                    $data['open_time'] ?? '09:00:00',
                    $data['close_time'] ?? '21:00:00',
                    isset($data['is_closed']) ? ($data['is_closed'] ? 1 : 0) : 0
                ]);
            }

            $this->db->commit();
            return $this->getByDay($day);

        } catch (Exception $e) {
            $this->db->rollback();
            throw new Exception('Failed to update gym hours: ' . $e->getMessage());
        }
    }

    /**
     * Update multiple days at once
     */
    public function updateMultiple($hoursData) {
        try {
            $this->db->beginTransaction();
            
            $updatedDays = [];
            
            foreach ($hoursData as $dayData) {
                if (!isset($dayData['day_of_week'])) {
                    continue;
                }
                
                $day = strtolower($dayData['day_of_week']);
                if (!in_array($day, $this->validDays)) {
                    continue;
                }
                
                $this->updateDay($day, $dayData);
                $updatedDays[] = $day;
            }

            $this->db->commit();
            
            // Return all updated hours
            $result = [];
            foreach ($updatedDays as $day) {
                $result[] = $this->getByDay($day);
            }
            
            return $result;

        } catch (Exception $e) {
            $this->db->rollback();
            throw new Exception('Failed to update multiple gym hours: ' . $e->getMessage());
        }
    }

    /**
     * Get current day status
     */
    public function getCurrentDayStatus() {
        $today = strtolower(date('l')); // monday, tuesday, etc.
        $currentTime = date('H:i:s');
        
        $hours = $this->getByDay($today);
        
        if (!$hours) {
            return [
                'day' => $today,
                'is_open' => false,
                'status' => 'closed',
                'message' => 'No hours set for today'
            ];
        }

        if ($hours['is_closed']) {
            return [
                'day' => $today,
                'is_open' => false,
                'status' => 'closed',
                'message' => 'Gym is closed today',
                'hours' => $hours
            ];
        }

        $isOpen = ($currentTime >= $hours['open_time'] && $currentTime <= $hours['close_time']);
        
        return [
            'day' => $today,
            'is_open' => $isOpen,
            'status' => $isOpen ? 'open' : 'closed',
            'current_time' => $currentTime,
            'hours' => $hours,
            'message' => $isOpen ? 'Gym is currently open' : 'Gym is currently closed'
        ];
    }

    /**
     * Get hours for the current week
     */
    public function getCurrentWeekHours() {
        $today = date('N'); // 1 = Monday, 7 = Sunday
        $weekStart = date('Y-m-d', strtotime('monday this week'));
        
        $hours = $this->getAll();
        $weekHours = [];
        
        foreach ($this->validDays as $index => $day) {
            $dayHours = null;
            foreach ($hours as $hour) {
                if ($hour['day_of_week'] === $day) {
                    $dayHours = $hour;
                    break;
                }
            }
            
            $dayNumber = $index + 1; // Convert to 1-7 (Monday = 1)
            $isToday = $dayNumber == $today;
            
            $weekHours[] = [
                'day' => $day,
                'day_number' => $dayNumber,
                'is_today' => $isToday,
                'date' => date('Y-m-d', strtotime($weekStart . ' +' . $index . ' days')),
                'hours' => $dayHours
            ];
        }
        
        return $weekHours;
    }

    /**
     * Check if gym is open at specific time
     */
    public function isOpenAt($day, $time) {
        $hours = $this->getByDay($day);
        
        if (!$hours || $hours['is_closed']) {
            return false;
        }
        
        return ($time >= $hours['open_time'] && $time <= $hours['close_time']);
    }

    /**
     * Get next opening time
     */
    public function getNextOpening() {
        $currentDay = strtolower(date('l'));
        $currentTime = date('H:i:s');
        
        // Check if open later today
        $todayHours = $this->getByDay($currentDay);
        if ($todayHours && !$todayHours['is_closed'] && $currentTime < $todayHours['open_time']) {
            return [
                'day' => $currentDay,
                'date' => date('Y-m-d'),
                'time' => $todayHours['open_time'],
                'message' => 'Opens later today at ' . date('g:i A', strtotime($todayHours['open_time']))
            ];
        }
        
        // Check next 7 days
        for ($i = 1; $i <= 7; $i++) {
            $checkDate = date('Y-m-d', strtotime("+$i days"));
            $checkDay = strtolower(date('l', strtotime($checkDate)));
            
            $hours = $this->getByDay($checkDay);
            if ($hours && !$hours['is_closed']) {
                return [
                    'day' => $checkDay,
                    'date' => $checkDate,
                    'time' => $hours['open_time'],
                    'message' => 'Opens ' . date('l', strtotime($checkDate)) . ' at ' . date('g:i A', strtotime($hours['open_time']))
                ];
            }
        }
        
        return [
            'message' => 'No upcoming opening times found'
        ];
    }

    /**
     * Validate time format
     */
    public function validateTime($time) {
        return preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', $time);
    }

    /**
     * Validate hours data
     */
    public function validateHours($data) {
        $errors = [];
        
        if (isset($data['open_time']) && !$this->validateTime($data['open_time'])) {
            $errors['open_time'] = 'Invalid time format. Use HH:MM:SS';
        }
        
        if (isset($data['close_time']) && !$this->validateTime($data['close_time'])) {
            $errors['close_time'] = 'Invalid time format. Use HH:MM:SS';
        }
        
        // Check that close time is after open time
        if (isset($data['open_time']) && isset($data['close_time'])) {
            if ($data['close_time'] <= $data['open_time']) {
                $errors['close_time'] = 'Close time must be after open time';
            }
        }
        
        return $errors;
    }

    /**
     * Get hours statistics
     */
    public function getStats() {
        $sql = "SELECT 
                    COUNT(*) as total_days_configured,
                    COUNT(CASE WHEN is_closed = 0 THEN 1 END) as open_days,
                    COUNT(CASE WHEN is_closed = 1 THEN 1 END) as closed_days,
                    AVG(TIME_TO_SEC(TIMEDIFF(close_time, open_time))/3600) as average_hours_per_day,
                    MIN(open_time) as earliest_opening,
                    MAX(close_time) as latest_closing
                FROM gym_hours 
                WHERE is_active = 1";
        
        $stmt = $this->db->execute($sql);
        return $stmt->fetch();
    }

    /**
     * Reset to default hours
     */
    public function resetToDefault() {
        $defaultHours = [
            ['day_of_week' => 'monday', 'open_time' => '05:00:00', 'close_time' => '23:00:00', 'is_closed' => false],
            ['day_of_week' => 'tuesday', 'open_time' => '05:00:00', 'close_time' => '23:00:00', 'is_closed' => false],
            ['day_of_week' => 'wednesday', 'open_time' => '05:00:00', 'close_time' => '23:00:00', 'is_closed' => false],
            ['day_of_week' => 'thursday', 'open_time' => '05:00:00', 'close_time' => '23:00:00', 'is_closed' => false],
            ['day_of_week' => 'friday', 'open_time' => '05:00:00', 'close_time' => '23:00:00', 'is_closed' => false],
            ['day_of_week' => 'saturday', 'open_time' => '06:00:00', 'close_time' => '22:00:00', 'is_closed' => false],
            ['day_of_week' => 'sunday', 'open_time' => '06:00:00', 'close_time' => '22:00:00', 'is_closed' => false]
        ];

        return $this->updateMultiple($defaultHours);
    }
}