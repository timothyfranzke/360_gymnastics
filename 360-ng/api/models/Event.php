<?php
/**
 * Event Model
 * Handles database operations for events
 */

class Event {
    private $db;
    private $table = 'events';

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get all events with optional filters
     */
    public function getAll($filters = [], $pagination = []) {
        $baseQuery = "SELECT * FROM {$this->table}";
        $conditions = [];
        $values = [];

        // Build search conditions
        if (!empty($filters['search'])) {
            $conditions[] = "(title LIKE ? OR description LIKE ?)";
            $values[] = '%' . $filters['search'] . '%';
            $values[] = '%' . $filters['search'] . '%';
        }

        // Filter by active status
        if (isset($filters['is_active'])) {
            $conditions[] = "is_active = ?";
            $values[] = $filters['is_active'] ? 1 : 0;
        }

        // Filter by date range
        if (!empty($filters['date_from'])) {
            $conditions[] = "date >= ?";
            $values[] = $filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $conditions[] = "date <= ?";
            $values[] = $filters['date_to'];
        }

        // Build ORDER BY clause
        $orderBy = "ORDER BY ";
        $allowedSortFields = ['date', 'title', 'cost', 'created_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortFields) ? $filters['sort_by'] : 'date';
        $sortOrder = in_array($filters['sort_order'] ?? '', ['ASC', 'DESC']) ? $filters['sort_order'] : 'ASC';
        $orderBy .= "$sortBy $sortOrder";

        // Build final query
        $query = $baseQuery;
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }
        $query .= " " . $orderBy;

        // Handle pagination
        if (!empty($pagination)) {
            $query .= " LIMIT {$pagination['page_size']} OFFSET {$pagination['offset']}";
        }

        $stmt = $this->db->execute($query, $values);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get total count with filters
     */
    public function getCount($filters = []) {
        $query = "SELECT COUNT(*) FROM {$this->table}";
        $conditions = [];
        $values = [];

        // Build search conditions (same as getAll)
        if (!empty($filters['search'])) {
            $conditions[] = "(title LIKE ? OR description LIKE ?)";
            $values[] = '%' . $filters['search'] . '%';
            $values[] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['is_active'])) {
            $conditions[] = "is_active = ?";
            $values[] = $filters['is_active'] ? 1 : 0;
        }

        if (!empty($filters['date_from'])) {
            $conditions[] = "date >= ?";
            $values[] = $filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $conditions[] = "date <= ?";
            $values[] = $filters['date_to'];
        }

        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }

        $stmt = $this->db->execute($query, $values);
        return $stmt->fetchColumn();
    }

    /**
     * Get active events
     */
    public function getActive($limit = null) {
        $query = "SELECT * FROM {$this->table} WHERE is_active = 1 ORDER BY date ASC";
        
        if ($limit) {
            $query .= " LIMIT ?";
            $stmt = $this->db->execute($query, [$limit]);
        } else {
            $stmt = $this->db->execute($query);
        }

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get upcoming events (active events with future dates)
     */
    public function getUpcoming($limit = null) {
        $query = "SELECT * FROM {$this->table} WHERE is_active = 1 AND date >= CURDATE() ORDER BY date ASC";
        
        if ($limit) {
            $query .= " LIMIT ?";
            $stmt = $this->db->execute($query, [$limit]);
        } else {
            $stmt = $this->db->execute($query);
        }

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get event by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create new event
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (title, date, cost, description, time, registration_link, is_active, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $values = [
            $data['title'],
            $data['date'],
            $data['cost'],
            $data['description'],
            $data['time'],
            $data['registration_link'],
            $data['is_active'] ?? 1
        ];

        $this->db->execute($query, $values);
        $id = $this->db->lastInsertId();
        
        return $this->getById($id);
    }

    /**
     * Update event
     */
    public function update($id, $data) {
        $fields = [];
        $values = [];

        $allowedFields = ['title', 'date', 'cost', 'description', 'time', 'registration_link', 'is_active'];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            throw new Exception('No valid fields to update');
        }

        $fields[] = "updated_at = NOW()";
        $values[] = $id;

        $query = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $this->db->execute($query, $values);

        return $this->getById($id);
    }

    /**
     * Delete event
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Get event statistics
     */
    public function getStats() {
        $stats = [];

        // Total events
        $stmt = $this->db->execute("SELECT COUNT(*) FROM {$this->table}");
        $stats['total'] = $stmt->fetchColumn();

        // Active events
        $stmt = $this->db->execute("SELECT COUNT(*) FROM {$this->table} WHERE is_active = 1");
        $stats['active'] = $stmt->fetchColumn();

        // Upcoming events (active and future date)
        $stmt = $this->db->execute("SELECT COUNT(*) FROM {$this->table} WHERE is_active = 1 AND date >= CURDATE()");
        $stats['upcoming'] = $stmt->fetchColumn();

        // This month's events
        $stmt = $this->db->execute("SELECT COUNT(*) FROM {$this->table} WHERE YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())");
        $stats['this_month'] = $stmt->fetchColumn();

        return $stats;
    }

    /**
     * Check if event exists
     */
    public function exists($id) {
        $query = "SELECT COUNT(*) FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        return $stmt->fetchColumn() > 0;
    }
}