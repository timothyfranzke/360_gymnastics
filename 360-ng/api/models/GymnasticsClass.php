<?php
/**
 * GymnasticsClass Model
 * Handles database operations for gymnastics classes
 */

class GymnasticsClass {
    private $db;
    private $table = 'gymnastics_classes';

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get all classes with optional filters
     */
    public function getAll($filters = [], $pagination = []) {
        $baseQuery = "SELECT * FROM {$this->table}";
        $conditions = [];
        $values = [];

        // Build search conditions
        if (!empty($filters['search'])) {
            $conditions[] = "(name LIKE ? OR description LIKE ? OR age_range LIKE ?)";
            $values[] = '%' . $filters['search'] . '%';
            $values[] = '%' . $filters['search'] . '%';
            $values[] = '%' . $filters['search'] . '%';
        }

        // Filter by featured status
        if (isset($filters['featured'])) {
            $conditions[] = "featured = ?";
            $values[] = $filters['featured'] ? 1 : 0;
        }

        // Filter by age range
        if (!empty($filters['age_range'])) {
            $conditions[] = "age_range LIKE ?";
            $values[] = '%' . $filters['age_range'] . '%';
        }

        // Build ORDER BY clause
        $orderBy = "ORDER BY ";
        $allowedSortFields = ['name', 'age_range', 'created_at', 'updated_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortFields) ? $filters['sort_by'] : 'name';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';
        $orderBy .= "{$sortBy} {$sortOrder}";

        // Build WHERE clause
        $whereClause = '';
        if (!empty($conditions)) {
            $whereClause = ' WHERE ' . implode(' AND ', $conditions);
        }

        // Build final query
        $query = $baseQuery . $whereClause . ' ' . $orderBy;

        // Add pagination if provided
        if (!empty($pagination['limit'])) {
            $limit = (int)$pagination['limit'];
            $offset = isset($pagination['offset']) ? (int)$pagination['offset'] : 0;
            $query .= " LIMIT {$limit} OFFSET {$offset}";
        }

        $stmt = $this->db->getConnection()->prepare($query);
        
        if (!empty($values)) {
            $stmt->execute($values);
        } else {
            $stmt->execute();
        }

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert and format results
        foreach ($results as &$result) {
            $result = $this->formatResult($result);
        }

        return $results;
    }

    /**
     * Get total count for pagination
     */
    public function getCount($filters = []) {
        $baseQuery = "SELECT COUNT(*) as total FROM {$this->table}";
        $conditions = [];
        $values = [];

        // Build search conditions (same as getAll)
        if (!empty($filters['search'])) {
            $conditions[] = "(name LIKE ? OR description LIKE ? OR age_range LIKE ?)";
            $values[] = '%' . $filters['search'] . '%';
            $values[] = '%' . $filters['search'] . '%';
            $values[] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['featured'])) {
            $conditions[] = "featured = ?";
            $values[] = $filters['featured'] ? 1 : 0;
        }

        if (!empty($filters['age_range'])) {
            $conditions[] = "age_range LIKE ?";
            $values[] = '%' . $filters['age_range'] . '%';
        }

        // Build WHERE clause
        $whereClause = '';
        if (!empty($conditions)) {
            $whereClause = ' WHERE ' . implode(' AND ', $conditions);
        }

        $query = $baseQuery . $whereClause;
        $stmt = $this->db->getConnection()->prepare($query);
        
        if (!empty($values)) {
            $stmt->execute($values);
        } else {
            $stmt->execute();
        }

        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    /**
     * Get class by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$id]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $result = $this->formatResult($result);
        }
        
        return $result;
    }

    /**
     * Create new class
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} 
                  (id, name, age_range, description, skills, structure, prerequisites, ratio, duration, url, featured, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = $this->db->getConnection()->prepare($query);
        
        return $stmt->execute([
            $data['id'],
            $data['name'],
            $data['ageRange'], // Fix field name to match interface
            $data['description'],
            json_encode($data['skills'] ?? []),
            json_encode($data['structure'] ?? []),
            json_encode($data['prerequisites'] ?? []),
            $data['ratio'] ?? null,
            $data['duration'] ?? null,
            $data['url'] ?? null,
            $data['featured'] ?? false
        ]);
    }

    /**
     * Update class
     */
    public function update($id, $data) {
        $fields = [];
        $values = [];

        // Field mapping from frontend to database
        $fieldMapping = [
            'name' => 'name',
            'ageRange' => 'age_range',
            'description' => 'description',
            'skills' => 'skills',
            'structure' => 'structure',
            'prerequisites' => 'prerequisites',
            'ratio' => 'ratio',
            'duration' => 'duration',
            'url' => 'url',
            'featured' => 'featured'
        ];
        
        foreach ($fieldMapping as $frontendField => $dbField) {
            if (array_key_exists($frontendField, $data)) {
                if (in_array($dbField, ['skills', 'structure', 'prerequisites'])) {
                    $fields[] = "{$dbField} = ?";
                    $values[] = json_encode($data[$frontendField] ?? []);
                } else {
                    $fields[] = "{$dbField} = ?";
                    $values[] = $data[$frontendField];
                }
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = "updated_at = NOW()";
        $values[] = $id;

        $query = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        
        return $stmt->execute($values);
    }

    /**
     * Delete class
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        return $stmt->execute([$id]);
    }

    /**
     * Get featured classes
     */
    public function getFeatured() {
        $query = "SELECT * FROM {$this->table} WHERE featured = 1 ORDER BY name ASC";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute();
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert and format results
        foreach ($results as &$result) {
            $result = $this->formatResult($result);
        }

        return $results;
    }

    /**
     * Search classes by name or description
     */
    public function search($query, $limit = null) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE name LIKE ? OR description LIKE ? OR age_range LIKE ?
                ORDER BY 
                    CASE 
                        WHEN name LIKE ? THEN 1
                        WHEN age_range LIKE ? THEN 2  
                        ELSE 3
                    END,
                    name ASC";
        
        if ($limit) {
            $sql .= " LIMIT ?";
        }

        $stmt = $this->db->prepare($sql);
        
        $searchTerm = '%' . $query . '%';
        $exactSearchTerm = $searchTerm;
        
        $params = [$searchTerm, $searchTerm, $searchTerm, $exactSearchTerm, $exactSearchTerm];
        if ($limit) {
            $params[] = $limit;
        }
        
        $stmt->execute($params);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert and format results
        foreach ($results as &$result) {
            $result = $this->formatResult($result);
        }

        return $results;
    }

    /**
     * Check if class ID exists
     */
    public function exists($id) {
        $query = "SELECT COUNT(*) as count FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$id]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
    }

    /**
     * Format database result for frontend consumption
     */
    private function formatResult($result) {
        if (!$result) return $result;

        // Convert database field names to frontend field names
        if (isset($result['age_range'])) {
            $result['ageRange'] = $result['age_range'];
            unset($result['age_range']);
        }

        // Convert JSON fields back to arrays
        $result['skills'] = json_decode($result['skills'] ?? '[]', true) ?: [];
        $result['structure'] = json_decode($result['structure'] ?? '[]', true) ?: [];
        $result['prerequisites'] = json_decode($result['prerequisites'] ?? '[]', true) ?: [];
        
        // Convert boolean
        $result['featured'] = (bool)$result['featured'];

        return $result;
    }
}