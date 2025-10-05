<?php
/**
 * Staff Model
 * Handles staff member data operations
 */

class Staff {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Create new staff member
     */
    public function create($staffData) {
        try {
            // Create staff record with simplified data
            $sql = "INSERT INTO staff (first_name, last_name, image, description, hire_date) 
                    VALUES (?, ?, ?, ?, ?)";
            
            $this->db->execute($sql, [
                $staffData['first_name'],
                $staffData['last_name'],
                $staffData['image'] ?? null,
                $staffData['description'] ?? null,
                $staffData['hire_date']
            ]);

            $staffId = $this->db->lastInsertId();
            return $this->findById($staffId);

        } catch (Exception $e) {
            throw new Exception('Failed to create staff member: ' . $e->getMessage());
        }
    }

    /**
     * Find staff member by ID
     */
    public function findById($id) {
        $sql = "SELECT * FROM staff WHERE id = ?";
        
        $stmt = $this->db->execute($sql, [$id]);
        $staff = $stmt->fetch();
        
        if ($staff) {
            $staff = $this->formatImageUrls($staff);
        }
        
        return $staff;
    }



    /**
     * Get all staff members with pagination and filtering
     */
    public function getAll($pagination, $filters = []) {
        $baseQuery = "SELECT * FROM staff";
        
        $conditions = [];
        $values = [];
        
        // Search filter
        if (!empty($filters['search'])) {
            $conditions[] = "(first_name LIKE ? OR last_name LIKE ? OR description LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $values = array_fill(0, 3, $searchTerm);
        }
        
        // Hire date range
        if (!empty($filters['hire_date_from'])) {
            $conditions[] = "hire_date >= ?";
            $values[] = $filters['hire_date_from'];
        }
        
        if (!empty($filters['hire_date_to'])) {
            $conditions[] = "hire_date <= ?";
            $values[] = $filters['hire_date_to'];
        }
        
        $query = $baseQuery;
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }
        
        // Count total
        $countQuery = str_replace('SELECT *', 'SELECT COUNT(*)', $query);
        $countStmt = $this->db->execute($countQuery, $values);
        $total = $countStmt->fetchColumn();
        
        // Add sorting
        $sortField = $filters['sort_by'] ?? 'hire_date';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'DESC');
        $allowedSortFields = ['first_name', 'last_name', 'hire_date', 'created_at'];
        
        if (in_array($sortField, $allowedSortFields)) {
            $query .= " ORDER BY $sortField $sortOrder";
        } else {
            $query .= " ORDER BY hire_date DESC";
        }
        
        // Add pagination
        $query .= " LIMIT {$pagination['page_size']} OFFSET {$pagination['offset']}";
        
        $stmt = $this->db->execute($query, $values);
        $staff = $stmt->fetchAll();
        
        // Format image URLs for all staff members
        foreach ($staff as &$member) {
            $member = $this->formatImageUrls($member);
        }
        
        return [
            'staff' => $staff,
            'total' => $total
        ];
    }

    /**
     * Update staff member
     */
    public function update($id, $staffData) {
        try {
            $staff = $this->findById($id);
            if (!$staff) {
                throw new Exception('Staff member not found');
            }

            // Update staff data
            $allowedFields = ['first_name', 'last_name', 'image', 'description', 'hire_date'];
            $fields = [];
            $values = [];

            foreach ($allowedFields as $field) {
                if (isset($staffData[$field])) {
                    $fields[] = "$field = ?";
                    $values[] = $staffData[$field];
                }
            }

            if (!empty($fields)) {
                $values[] = $id;
                $sql = "UPDATE staff SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
                $this->db->execute($sql, $values);
            }

            return $this->findById($id);

        } catch (Exception $e) {
            throw new Exception('Failed to update staff member: ' . $e->getMessage());
        }
    }

    /**
     * Delete staff member
     */
    public function delete($id) {
        try {
            $staff = $this->findById($id);
            if (!$staff) {
                throw new Exception('Staff member not found');
            }

            // Delete associated photo files
            if (!empty($staff['image'])) {
                $filename = basename($staff['image']);
                FileUploadUtility::deleteStaffPhoto($filename);
            }

            // Delete staff record
            $this->db->execute("DELETE FROM staff WHERE id = ?", [$id]);
            
            return true;

        } catch (Exception $e) {
            throw new Exception('Failed to delete staff member: ' . $e->getMessage());
        }
    }

    /**
     * Get staff statistics
     */
    public function getStats() {
        $sql = "SELECT 
                    COUNT(*) as total_staff,
                    AVG(DATEDIFF(CURDATE(), hire_date)) as average_tenure_days
                FROM staff";
        
        $stmt = $this->db->execute($sql);
        return $stmt->fetch();
    }






    /**
     * Get staff members for homepage display
     * Public endpoint - no authentication required
     */
    public function getHomepageStaff() {
        $sql = "SELECT id, first_name, last_name, hire_date, image, description,
                       TIMESTAMPDIFF(YEAR, hire_date, CURDATE()) as years_at_gym
                FROM staff
                ORDER BY hire_date ASC";
        
        $stmt = $this->db->execute($sql);
        $staff = $stmt->fetchAll();
        
        // Format the response
        foreach ($staff as &$member) {
            // Ensure years_at_gym is at least 0
            $member['years_at_gym'] = max(0, (int)$member['years_at_gym']);
            
            // Convert image URL to full URLs
            $member = $this->formatImageUrls($member);
            
            // Ensure description is null if empty
            if (empty($member['description'])) {
                $member['description'] = null;
            }
        }
        
        return $staff;
    }

    /**
     * Validate image URL format
     */
    public function validateImageUrl($url) {
        if (empty($url)) {
            return true; // Allow empty/null values
        }
        
        // Check if it's a valid URL
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }
        
        // Check if URL has appropriate file extension for images
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
        
        return in_array($extension, $allowedExtensions) || empty($extension); // Allow URLs without extensions
    }

    /**
     * Format image URLs to include full API endpoints
     */
    private function formatImageUrls($staff) {
        if (!empty($staff['image'])) {
            $filename = basename($staff['image']);
            
            // Check if this is a local file (starts with 'uploads/')
            if (strpos($staff['image'], 'uploads/') === 0) {
                $staff['image_url'] = '/api/v1/files/staff/' . $filename;
                $staff['image_thumbnail_url'] = '/api/v1/files/staff/thumbnails/' . $filename;
            } else {
                // External URL - keep as is but add thumbnail as null
                $staff['image_url'] = $staff['image'];
                $staff['image_thumbnail_url'] = null;
            }
        } else {
            $staff['image_url'] = null;
            $staff['image_thumbnail_url'] = null;
        }
        
        return $staff;
    }

    /**
     * Clean up old image files when updating
     */
    public function cleanupOldImage($staffId, $excludeFilename = null) {
        $staff = $this->findById($staffId);
        if (!$staff || empty($staff['image'])) {
            return;
        }

        $currentFilename = basename($staff['image']);
        
        // Skip if this is the file we want to keep
        if ($excludeFilename && $currentFilename === $excludeFilename) {
            return;
        }

        // Delete the old file
        FileUploadUtility::deleteStaffPhoto($currentFilename);
    }

    /**
     * Check if image URL is a local file
     */
    public function isLocalImage($imageUrl) {
        return !empty($imageUrl) && strpos($imageUrl, 'uploads/') === 0;
    }

    /**
     * Get image file info
     */
    public function getImageInfo($staffId) {
        $staff = $this->findById($staffId);
        if (!$staff || empty($staff['image'])) {
            return null;
        }

        if (!$this->isLocalImage($staff['image'])) {
            return [
                'type' => 'external',
                'url' => $staff['image']
            ];
        }

        $filename = basename($staff['image']);
        return FileUploadUtility::getFileInfo($filename);
    }
}