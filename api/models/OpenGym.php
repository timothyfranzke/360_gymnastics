<?php
/**
 * OpenGym Model
 * Handles database operations for open gym configurations
 */

class OpenGym {
    private $db;
    private $table = 'open_gym';
    private $ageGroupsTable = 'open_gym_age_groups';

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get main open gym configuration
     */
    public function getMainConfig() {
        $query = "SELECT * FROM {$this->table} WHERE type = 'main' ORDER BY created_at DESC LIMIT 1";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $result = $this->formatResult($result);
        }
        
        return $result;
    }

    /**
     * Get structured open gym configuration
     */
    public function getStructuredConfig() {
        $query = "SELECT * FROM {$this->table} WHERE type = 'structured' ORDER BY created_at DESC LIMIT 1";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $result = $this->formatResult($result);
        }
        
        return $result;
    }

    /**
     * Get all age groups
     */
    public function getAgeGroups() {
        $query = "SELECT * FROM {$this->ageGroupsTable} ORDER BY sort_order ASC, created_at ASC";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute();
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($results as &$result) {
            $result = $this->formatAgeGroupResult($result);
        }
        
        return $results;
    }

    /**
     * Get age group by ID
     */
    public function getAgeGroupById($id) {
        $query = "SELECT * FROM {$this->ageGroupsTable} WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        $stmt->execute([$id]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $result = $this->formatAgeGroupResult($result);
        }
        
        return $result;
    }

    /**
     * Update main configuration
     */
    public function updateMainConfig($data) {
        // First check if main config exists
        $existing = $this->getMainConfig();
        
        if ($existing) {
            return $this->updateConfig($existing['id'], $data);
        } else {
            return $this->createConfig('main', $data);
        }
    }

    /**
     * Update structured configuration
     */
    public function updateStructuredConfig($data) {
        // First check if structured config exists
        $existing = $this->getStructuredConfig();
        
        if ($existing) {
            return $this->updateConfig($existing['id'], $data);
        } else {
            return $this->createConfig('structured', $data);
        }
    }

    /**
     * Create age group
     */
    public function createAgeGroup($data) {
        $query = "INSERT INTO {$this->ageGroupsTable} 
                  (title, subtitle, days, time, price, price_unit, notes, sort_order, color_theme, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = $this->db->getConnection()->prepare($query);
        
        $result = $stmt->execute([
            $data['title'],
            $data['subtitle'] ?? null,
            $data['days'] ?? null,
            $data['time'] ?? null,
            $data['price'] ?? null,
            $data['priceUnit'] ?? 'per session',
            $data['notes'] ?? null,
            $data['sortOrder'] ?? 0,
            $data['colorTheme'] ?? 'cyan'
        ]);

        if ($result) {
            return $this->db->getConnection()->lastInsertId();
        }

        return false;
    }

    /**
     * Update age group
     */
    public function updateAgeGroup($id, $data) {
        $fields = [];
        $values = [];

        $fieldMapping = [
            'title' => 'title',
            'subtitle' => 'subtitle',
            'days' => 'days',
            'time' => 'time',
            'price' => 'price',
            'priceUnit' => 'price_unit',
            'notes' => 'notes',
            'sortOrder' => 'sort_order',
            'colorTheme' => 'color_theme'
        ];
        
        foreach ($fieldMapping as $frontendField => $dbField) {
            if (array_key_exists($frontendField, $data)) {
                $fields[] = "{$dbField} = ?";
                $values[] = $data[$frontendField];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = "updated_at = NOW()";
        $values[] = $id;

        $query = "UPDATE {$this->ageGroupsTable} SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        
        return $stmt->execute($values);
    }

    /**
     * Delete age group
     */
    public function deleteAgeGroup($id) {
        $query = "DELETE FROM {$this->ageGroupsTable} WHERE id = ?";
        $stmt = $this->db->getConnection()->prepare($query);
        return $stmt->execute([$id]);
    }

    /**
     * Private method to create config
     */
    private function createConfig($type, $data) {
        $query = "INSERT INTO {$this->table} 
                  (type, title, subtitle, description, schedule, features, important_info, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = $this->db->getConnection()->prepare($query);
        
        $result = $stmt->execute([
            $type,
            $data['title'] ?? null,
            $data['subtitle'] ?? null,
            $data['description'] ?? null,
            json_encode($data['schedule'] ?? []),
            json_encode($data['features'] ?? []),
            json_encode($data['importantInfo'] ?? [])
        ]);

        if ($result) {
            return $this->db->getConnection()->lastInsertId();
        }

        return false;
    }

    /**
     * Private method to update config
     */
    private function updateConfig($id, $data) {
        $fields = [];
        $values = [];

        $fieldMapping = [
            'title' => 'title',
            'subtitle' => 'subtitle',
            'description' => 'description',
            'schedule' => 'schedule',
            'features' => 'features',
            'importantInfo' => 'important_info'
        ];
        
        foreach ($fieldMapping as $frontendField => $dbField) {
            if (array_key_exists($frontendField, $data)) {
                if (in_array($dbField, ['schedule', 'features', 'important_info'])) {
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
     * Format database result for frontend consumption
     */
    private function formatResult($result) {
        if (!$result) return $result;

        // Convert JSON fields back to arrays
        $result['schedule'] = json_decode($result['schedule'] ?? '[]', true) ?: [];
        $result['features'] = json_decode($result['features'] ?? '[]', true) ?: [];
        $result['importantInfo'] = json_decode($result['important_info'] ?? '[]', true) ?: [];
        
        // Remove the snake_case field
        unset($result['important_info']);

        return $result;
    }

    /**
     * Format age group result for frontend consumption
     */
    private function formatAgeGroupResult($result) {
        if (!$result) return $result;

        // Convert database field names to frontend field names
        $result['priceUnit'] = $result['price_unit'];
        $result['sortOrder'] = (int)$result['sort_order'];
        $result['colorTheme'] = $result['color_theme'];
        
        // Remove snake_case fields
        unset($result['price_unit'], $result['sort_order'], $result['color_theme']);

        // Convert numeric fields
        $result['price'] = $result['price'] ? (float)$result['price'] : null;

        return $result;
    }
}