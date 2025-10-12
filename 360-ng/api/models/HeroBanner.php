<?php
/**
 * HeroBanner Model
 * Handles hero banner data operations for managing banner displays
 */

class HeroBanner {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get current banner configuration
     * Returns the active banner settings
     */
    public function getCurrent() {
        try {
            $sql = "SELECT hb.*, u.username as created_by_username,
                           CONCAT(u.first_name, ' ', u.last_name) as created_by_name
                    FROM hero_banner hb
                    LEFT JOIN users u ON hb.created_by = u.id
                    ORDER BY hb.updated_at DESC
                    LIMIT 1";
            
            $stmt = $this->db->execute($sql);
            $banner = $stmt->fetch();
            
            // If no banner exists, create a default one
            if (!$banner) {
                return $this->createDefault();
            }
            
            return $banner;

        } catch (Exception $e) {
            throw new Exception('Failed to retrieve banner configuration: ' . $e->getMessage());
        }
    }

    /**
     * Update banner configuration
     */
    public function update($data, $userId) {
        try {
            // First check if a banner exists
            $current = $this->getCurrent();
            
            if ($current) {
                // Update existing banner
                $allowedFields = ['message', 'is_visible', 'background_color', 'text_color'];
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

                $values[] = $current['id'];
                $sql = "UPDATE hero_banner SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
                
                $this->db->execute($sql, $values);
                return $this->getCurrent();
            } else {
                // Create new banner if none exists
                return $this->create($data, $userId);
            }

        } catch (Exception $e) {
            throw new Exception('Failed to update banner: ' . $e->getMessage());
        }
    }

    /**
     * Create new banner configuration
     */
    public function create($data, $userId) {
        try {
            $sql = "INSERT INTO hero_banner (message, is_visible, background_color, text_color, created_by) 
                    VALUES (?, ?, ?, ?, ?)";
            
            $this->db->execute($sql, [
                $data['message'] ?? 'Welcome to 360 Gym!',
                isset($data['is_visible']) ? (bool)$data['is_visible'] : true,
                $data['background_color'] ?? '#1e40af',
                $data['text_color'] ?? '#ffffff',
                $userId
            ]);

            return $this->getCurrent();

        } catch (Exception $e) {
            throw new Exception('Failed to create banner: ' . $e->getMessage());
        }
    }

    /**
     * Create default banner configuration
     */
    private function createDefault() {
        try {
            // Use system user (id = 1) for default banner
            $defaultData = [
                'message' => 'Welcome to 360 Gym!',
                'is_visible' => true,
                'background_color' => '#1e40af',
                'text_color' => '#ffffff'
            ];
            
            return $this->create($defaultData, 1);

        } catch (Exception $e) {
            throw new Exception('Failed to create default banner: ' . $e->getMessage());
        }
    }

    /**
     * Toggle banner visibility
     */
    public function toggleVisibility() {
        try {
            $current = $this->getCurrent();
            
            if (!$current) {
                throw new Exception('No banner configuration found');
            }

            $sql = "UPDATE hero_banner SET is_visible = NOT is_visible, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            $this->db->execute($sql, [$current['id']]);
            
            return $this->getCurrent();

        } catch (Exception $e) {
            throw new Exception('Failed to toggle banner visibility: ' . $e->getMessage());
        }
    }

    /**
     * Get banner statistics
     */
    public function getStats() {
        try {
            $sql = "SELECT 
                        COUNT(*) as total_updates,
                        MAX(updated_at) as last_updated,
                        (SELECT is_visible FROM hero_banner ORDER BY updated_at DESC LIMIT 1) as current_visibility
                    FROM hero_banner";
            
            $stmt = $this->db->execute($sql);
            return $stmt->fetch();

        } catch (Exception $e) {
            throw new Exception('Failed to retrieve banner statistics: ' . $e->getMessage());
        }
    }

    /**
     * Validate banner data
     */
    public function validateData($data) {
        $errors = [];

        // Validate message
        if (isset($data['message'])) {
            if (empty(trim($data['message']))) {
                $errors['message'][] = 'Banner message cannot be empty';
            } elseif (strlen($data['message']) > 500) {
                $errors['message'][] = 'Banner message must not exceed 500 characters';
            }
        }

        // Validate colors (hex format)
        if (isset($data['background_color'])) {
            if (!preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $data['background_color'])) {
                $errors['background_color'][] = 'Background color must be a valid hex color (e.g., #1e40af)';
            }
        }

        if (isset($data['text_color'])) {
            if (!preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $data['text_color'])) {
                $errors['text_color'][] = 'Text color must be a valid hex color (e.g., #ffffff)';
            }
        }

        // Validate visibility
        if (isset($data['is_visible'])) {
            if (!is_bool($data['is_visible']) && !in_array($data['is_visible'], ['true', 'false', '1', '0', 1, 0])) {
                $errors['is_visible'][] = 'Banner visibility must be a boolean value';
            }
        }

        return $errors;
    }

    /**
     * Sanitize banner data for output
     */
    public function sanitizeOutput($data) {
        if (!is_array($data)) {
            return $data;
        }

        // Convert boolean fields
        if (isset($data['is_visible'])) {
            $data['is_visible'] = (bool)$data['is_visible'];
        }

        // Sanitize text fields
        if (isset($data['message'])) {
            $data['message'] = htmlspecialchars($data['message'], ENT_QUOTES, 'UTF-8');
        }

        // Ensure color codes are properly formatted
        if (isset($data['background_color'])) {
            $data['background_color'] = strtolower($data['background_color']);
        }

        if (isset($data['text_color'])) {
            $data['text_color'] = strtolower($data['text_color']);
        }

        return $data;
    }

    /**
     * Check if user can edit banner
     */
    public function canEdit($userId, $userRole) {
        // Only admins and staff can edit banners
        return in_array($userRole, ['admin', 'staff']);
    }
}