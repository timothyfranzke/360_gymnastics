<?php
/**
 * Gym Closure Model
 * Handles special closures and holiday management
 */

class GymClosure {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Create new gym closure
     */
    public function create($data) {
        try {
            // Check for conflicting closures on the same date
            if ($this->hasClosureOnDate($data['closure_date'])) {
                throw new Exception('A closure already exists for this date');
            }

            $sql = "INSERT INTO gym_closures (closure_date, reason, description, is_all_day, 
                                            start_time, end_time, created_by) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            $this->db->execute($sql, [
                $data['closure_date'],
                $data['reason'],
                $data['description'] ?? null,
                isset($data['is_all_day']) ? ($data['is_all_day'] ? 1 : 0) : 1,
                $data['start_time'] ?? null,
                $data['end_time'] ?? null,
                $data['created_by']
            ]);

            $id = $this->db->lastInsertId();
            return $this->findById($id);

        } catch (Exception $e) {
            throw new Exception('Failed to create gym closure: ' . $e->getMessage());
        }
    }

    /**
     * Find closure by ID
     */
    public function findById($id) {
        $sql = "SELECT gc.*, u.username as created_by_username,
                       CONCAT(u.first_name, ' ', u.last_name) as created_by_name
                FROM gym_closures gc
                LEFT JOIN users u ON gc.created_by = u.id
                WHERE gc.id = ?";
        
        $stmt = $this->db->execute($sql, [$id]);
        return $stmt->fetch();
    }

    /**
     * Get all closures with pagination and filtering
     */
    public function getAll($pagination, $filters = []) {
        $baseQuery = "SELECT gc.*, u.username as created_by_username,
                             CONCAT(u.first_name, ' ', u.last_name) as created_by_name
                      FROM gym_closures gc
                      LEFT JOIN users u ON gc.created_by = u.id";
        
        $conditions = [];
        $values = [];
        
        // Search filter
        if (!empty($filters['search'])) {
            $conditions[] = "(gc.reason LIKE ? OR gc.description LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $values[] = $searchTerm;
            $values[] = $searchTerm;
        }
        
        // Date range filter
        if (!empty($filters['date_from'])) {
            $conditions[] = "gc.closure_date >= ?";
            $values[] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $conditions[] = "gc.closure_date <= ?";
            $values[] = $filters['date_to'];
        }
        
        // All day filter
        if (isset($filters['is_all_day'])) {
            $conditions[] = "gc.is_all_day = ?";
            $values[] = $filters['is_all_day'] ? 1 : 0;
        }
        
        // Future closures only
        if (!empty($filters['future_only'])) {
            $conditions[] = "gc.closure_date >= CURDATE()";
        }
        
        // Past closures only
        if (!empty($filters['past_only'])) {
            $conditions[] = "gc.closure_date < CURDATE()";
        }
        
        $query = $baseQuery;
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }
        
        // Count total
        $countQuery = str_replace(
            'SELECT gc.*, u.username as created_by_username, CONCAT(u.first_name, \' \', u.last_name) as created_by_name',
            'SELECT COUNT(*)',
            $query
        );
        $countStmt = $this->db->execute($countQuery, $values);
        $total = $countStmt->fetchColumn();
        
        // Add sorting
        $sortField = $filters['sort_by'] ?? 'closure_date';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'ASC');
        $allowedSortFields = ['closure_date', 'reason', 'created_at'];
        
        if (in_array($sortField, $allowedSortFields)) {
            $query .= " ORDER BY gc.$sortField $sortOrder";
        } else {
            $query .= " ORDER BY gc.closure_date ASC";
        }
        
        // Add pagination
        $query .= " LIMIT {$pagination['page_size']} OFFSET {$pagination['offset']}";
        
        $stmt = $this->db->execute($query, $values);
        $closures = $stmt->fetchAll();
        
        return [
            'closures' => $closures,
            'total' => $total
        ];
    }

    /**
     * Update closure
     */
    public function update($id, $data) {
        $allowedFields = ['closure_date', 'reason', 'description', 'is_all_day', 'start_time', 'end_time'];
        $fields = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                if ($field === 'is_all_day') {
                    $values[] = $data[$field] ? 1 : 0;
                } else {
                    $values[] = $data[$field];
                }
            }
        }

        if (empty($fields)) {
            throw new Exception('No valid fields to update');
        }

        // Check for date conflicts if date is being changed
        if (isset($data['closure_date'])) {
            $existing = $this->findById($id);
            if ($existing && $existing['closure_date'] !== $data['closure_date']) {
                if ($this->hasClosureOnDate($data['closure_date'], $id)) {
                    throw new Exception('A closure already exists for this date');
                }
            }
        }

        $values[] = $id;
        $sql = "UPDATE gym_closures SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        
        $this->db->execute($sql, $values);
        return $this->findById($id);
    }

    /**
     * Delete closure
     */
    public function delete($id) {
        $sql = "DELETE FROM gym_closures WHERE id = ?";
        $this->db->execute($sql, [$id]);
        return true;
    }

    /**
     * Check if gym is closed on specific date
     */
    public function isClosedOnDate($date, $time = null) {
        $sql = "SELECT * FROM gym_closures WHERE closure_date = ?";
        $stmt = $this->db->execute($sql, [$date]);
        $closure = $stmt->fetch();
        
        if (!$closure) {
            return false;
        }
        
        // If it's an all-day closure
        if ($closure['is_all_day']) {
            return [
                'is_closed' => true,
                'closure' => $closure,
                'reason' => $closure['reason']
            ];
        }
        
        // If specific time is provided, check if it's within closure hours
        if ($time && $closure['start_time'] && $closure['end_time']) {
            $isClosed = ($time >= $closure['start_time'] && $time <= $closure['end_time']);
            return [
                'is_closed' => $isClosed,
                'closure' => $closure,
                'reason' => $isClosed ? $closure['reason'] : null
            ];
        }
        
        // Partial day closure exists but no time specified
        return [
            'is_closed' => false,
            'has_partial_closure' => true,
            'closure' => $closure
        ];
    }

    /**
     * Get upcoming closures
     */
    public function getUpcoming($limit = 10) {
        $sql = "SELECT gc.*, u.username as created_by_username,
                       CONCAT(u.first_name, ' ', u.last_name) as created_by_name
                FROM gym_closures gc
                LEFT JOIN users u ON gc.created_by = u.id
                WHERE gc.closure_date >= CURDATE()
                ORDER BY gc.closure_date ASC
                LIMIT ?";
        
        $stmt = $this->db->execute($sql, [$limit]);
        return $stmt->fetchAll();
    }

    /**
     * Get closures for current month
     */
    public function getCurrentMonth() {
        $firstDay = date('Y-m-01');
        $lastDay = date('Y-m-t');
        
        $sql = "SELECT gc.*, u.username as created_by_username,
                       CONCAT(u.first_name, ' ', u.last_name) as created_by_name
                FROM gym_closures gc
                LEFT JOIN users u ON gc.created_by = u.id
                WHERE gc.closure_date BETWEEN ? AND ?
                ORDER BY gc.closure_date ASC";
        
        $stmt = $this->db->execute($sql, [$firstDay, $lastDay]);
        return $stmt->fetchAll();
    }

    /**
     * Mark gym as closed for today
     */
    public function closeForToday($reason, $createdBy, $description = null) {
        $today = date('Y-m-d');
        
        // Check if already closed today
        if ($this->hasClosureOnDate($today)) {
            throw new Exception('Gym is already marked as closed for today');
        }
        
        return $this->create([
            'closure_date' => $today,
            'reason' => $reason,
            'description' => $description,
            'is_all_day' => true,
            'created_by' => $createdBy
        ]);
    }

    /**
     * Create emergency closure
     */
    public function createEmergencyClosure($reason, $createdBy, $description = null, $endDate = null) {
        $today = date('Y-m-d');
        $endDate = $endDate ?: $today;
        
        $closures = [];
        $currentDate = $today;
        
        while ($currentDate <= $endDate) {
            if (!$this->hasClosureOnDate($currentDate)) {
                $closures[] = $this->create([
                    'closure_date' => $currentDate,
                    'reason' => 'Emergency: ' . $reason,
                    'description' => $description,
                    'is_all_day' => true,
                    'created_by' => $createdBy
                ]);
            }
            $currentDate = date('Y-m-d', strtotime($currentDate . ' +1 day'));
        }
        
        return $closures;
    }

    /**
     * Get closure statistics
     */
    public function getStats() {
        $sql = "SELECT 
                    COUNT(*) as total_closures,
                    COUNT(CASE WHEN closure_date >= CURDATE() THEN 1 END) as future_closures,
                    COUNT(CASE WHEN closure_date < CURDATE() THEN 1 END) as past_closures,
                    COUNT(CASE WHEN is_all_day = 1 THEN 1 END) as all_day_closures,
                    COUNT(CASE WHEN is_all_day = 0 THEN 1 END) as partial_closures,
                    COUNT(CASE WHEN closure_date = CURDATE() THEN 1 END) as today_closures
                FROM gym_closures";
        
        $stmt = $this->db->execute($sql);
        return $stmt->fetch();
    }

    /**
     * Check if there's a closure on specific date (excluding specific ID)
     */
    private function hasClosureOnDate($date, $excludeId = null) {
        $sql = "SELECT id FROM gym_closures WHERE closure_date = ?";
        $params = [$date];
        
        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $this->db->execute($sql, $params);
        return $stmt->rowCount() > 0;
    }

    /**
     * Validate closure times
     */
    public function validateTimes($data) {
        $errors = [];
        
        // If not all day, start and end times are required
        if (isset($data['is_all_day']) && !$data['is_all_day']) {
            if (empty($data['start_time'])) {
                $errors['start_time'] = 'Start time is required for partial day closures';
            }
            if (empty($data['end_time'])) {
                $errors['end_time'] = 'End time is required for partial day closures';
            }
            
            // Validate time format
            if (!empty($data['start_time']) && !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', $data['start_time'])) {
                $errors['start_time'] = 'Invalid time format. Use HH:MM:SS';
            }
            
            if (!empty($data['end_time']) && !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', $data['end_time'])) {
                $errors['end_time'] = 'Invalid time format. Use HH:MM:SS';
            }
            
            // Check that end time is after start time
            if (!empty($data['start_time']) && !empty($data['end_time'])) {
                if ($data['end_time'] <= $data['start_time']) {
                    $errors['end_time'] = 'End time must be after start time';
                }
            }
        }
        
        return $errors;
    }

    /**
     * Check if user can edit closure
     */
    public function canEdit($closureId, $userId, $userRole) {
        // Admins can edit any closure
        if ($userRole === 'admin') {
            return true;
        }
        
        // Staff can edit their own closures
        if ($userRole === 'staff') {
            $closure = $this->findById($closureId);
            return $closure && $closure['created_by'] == $userId;
        }
        
        return false;
    }
}