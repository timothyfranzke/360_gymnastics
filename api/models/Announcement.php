<?php
/**
 * Announcement Model
 * Handles announcement data operations
 */

class Announcement {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Create new announcement
     */
    public function create($data) {
        try {
            $sql = "INSERT INTO announcements (title, content, type, priority, start_date, end_date, created_by) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            $this->db->execute($sql, [
                $data['title'],
                $data['content'],
                $data['type'] ?? 'general',
                $data['priority'] ?? 'medium',
                $data['start_date'],
                $data['end_date'] ?? null,
                $data['created_by']
            ]);

            $id = $this->db->lastInsertId();
            return $this->findById($id);

        } catch (Exception $e) {
            throw new Exception('Failed to create announcement: ' . $e->getMessage());
        }
    }

    /**
     * Find announcement by ID
     */
    public function findById($id) {
        $sql = "SELECT a.*, u.username as created_by_username,
                       CONCAT(u.first_name, ' ', u.last_name) as created_by_name
                FROM announcements a
                LEFT JOIN users u ON a.created_by = u.id
                WHERE a.id = ?";
        
        $stmt = $this->db->execute($sql, [$id]);
        return $stmt->fetch();
    }

    /**
     * Get all announcements with pagination and filtering
     */
    public function getAll($pagination, $filters = []) {
        $baseQuery = "SELECT a.*, u.username as created_by_username,
                             CONCAT(u.first_name, ' ', u.last_name) as created_by_name
                      FROM announcements a
                      LEFT JOIN users u ON a.created_by = u.id";
        
        $conditions = [];
        $values = [];
        
        // Search filter
        if (!empty($filters['search'])) {
            $conditions[] = "(a.title LIKE ? OR a.content LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $values[] = $searchTerm;
            $values[] = $searchTerm;
        }
        
        // Type filter
        if (!empty($filters['type'])) {
            $conditions[] = "a.type = ?";
            $values[] = $filters['type'];
        }
        
        // Priority filter
        if (!empty($filters['priority'])) {
            $conditions[] = "a.priority = ?";
            $values[] = $filters['priority'];
        }
        
        // Active filter
        if (isset($filters['is_active'])) {
            $conditions[] = "a.is_active = ?";
            $values[] = $filters['is_active'] ? 1 : 0;
        }
        
        // Date range filter
        if (!empty($filters['date_from'])) {
            $conditions[] = "a.start_date >= ?";
            $values[] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $conditions[] = "(a.end_date IS NULL OR a.end_date <= ?)";
            $values[] = $filters['date_to'];
        }
        
        // Current announcements (within date range)
        if (!empty($filters['current_only'])) {
            $today = date('Y-m-d');
            $conditions[] = "a.start_date <= ? AND (a.end_date IS NULL OR a.end_date >= ?)";
            $values[] = $today;
            $values[] = $today;
        }
        
        $query = $baseQuery;
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }
        
        // Count total
        $countQuery = str_replace(
            'SELECT a.*, u.username as created_by_username, CONCAT(u.first_name, \' \', u.last_name) as created_by_name',
            'SELECT COUNT(*)',
            $query
        );
        $countStmt = $this->db->execute($countQuery, $values);
        $total = $countStmt->fetchColumn();
        
        // Add sorting
        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'DESC');
        $allowedSortFields = ['title', 'type', 'priority', 'start_date', 'end_date', 'created_at'];
        
        if (in_array($sortField, $allowedSortFields)) {
            $query .= " ORDER BY a.$sortField $sortOrder";
        } else {
            $query .= " ORDER BY a.created_at DESC";
        }
        
        // Add pagination
        $query .= " LIMIT {$pagination['page_size']} OFFSET {$pagination['offset']}";
        
        $stmt = $this->db->execute($query, $values);
        $announcements = $stmt->fetchAll();
        
        return [
            'announcements' => $announcements,
            'total' => $total
        ];
    }

    /**
     * Update announcement
     */
    public function update($id, $data) {
        $allowedFields = ['title', 'content', 'type', 'priority', 'start_date', 'end_date', 'is_active'];
        $fields = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            throw new Exception('No valid fields to update');
        }

        $values[] = $id;
        $sql = "UPDATE announcements SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        
        $this->db->execute($sql, $values);
        return $this->findById($id);
    }

    /**
     * Delete announcement
     */
    public function delete($id) {
        $sql = "DELETE FROM announcements WHERE id = ?";
        $this->db->execute($sql, [$id]);
        return true;
    }

    /**
     * Toggle announcement active status
     */
    public function toggleActive($id) {
        $sql = "UPDATE announcements SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $this->db->execute($sql, [$id]);
        return $this->findById($id);
    }

    /**
     * Get active announcements for public display
     */
    public function getActiveAnnouncements($limit = null) {
        $today = date('Y-m-d');
        
        $sql = "SELECT a.id, a.title, a.content, a.type, a.priority, a.start_date, a.end_date, a.created_at
                FROM announcements a
                WHERE a.is_active = 1 
                  AND a.start_date <= ?
                  AND (a.end_date IS NULL OR a.end_date >= ?)
                ORDER BY 
                    CASE a.priority 
                        WHEN 'critical' THEN 1
                        WHEN 'high' THEN 2
                        WHEN 'medium' THEN 3
                        WHEN 'low' THEN 4
                    END,
                    a.created_at DESC";
        
        if ($limit) {
            $sql .= " LIMIT " . intval($limit);
        }
        
        $stmt = $this->db->execute($sql, [$today, $today]);
        return $stmt->fetchAll();
    }

    /**
     * Get announcements by type
     */
    public function getByType($type, $limit = null) {
        $today = date('Y-m-d');
        
        $sql = "SELECT a.*, u.username as created_by_username,
                       CONCAT(u.first_name, ' ', u.last_name) as created_by_name
                FROM announcements a
                LEFT JOIN users u ON a.created_by = u.id
                WHERE a.type = ? 
                  AND a.is_active = 1
                  AND a.start_date <= ?
                  AND (a.end_date IS NULL OR a.end_date >= ?)
                ORDER BY a.created_at DESC";
        
        if ($limit) {
            $sql .= " LIMIT " . intval($limit);
        }
        
        $stmt = $this->db->execute($sql, [$type, $today, $today]);
        return $stmt->fetchAll();
    }

    /**
     * Get announcements statistics
     */
    public function getStats() {
        $sql = "SELECT 
                    COUNT(*) as total_announcements,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_announcements,
                    COUNT(CASE WHEN type = 'general' THEN 1 END) as general_announcements,
                    COUNT(CASE WHEN type = 'class' THEN 1 END) as class_announcements,
                    COUNT(CASE WHEN type = 'maintenance' THEN 1 END) as maintenance_announcements,
                    COUNT(CASE WHEN type = 'event' THEN 1 END) as event_announcements,
                    COUNT(CASE WHEN type = 'closure' THEN 1 END) as closure_announcements,
                    COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_announcements,
                    COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_announcements
                FROM announcements";
        
        $stmt = $this->db->execute($sql);
        return $stmt->fetch();
    }

    /**
     * Check if user can edit announcement
     */
    public function canEdit($announcementId, $userId, $userRole) {
        // Admins can edit any announcement
        if ($userRole === 'admin') {
            return true;
        }
        
        // Staff can edit their own announcements
        if ($userRole === 'staff') {
            $announcement = $this->findById($announcementId);
            return $announcement && $announcement['created_by'] == $userId;
        }
        
        return false;
    }
}