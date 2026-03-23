<?php
/**
 * ClassPageSettings Model
 * Handles class page settings (description, pricing tiers, registration fee)
 */

class ClassPageSettings {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get current settings
     */
    public function getCurrent() {
        try {
            $sql = "SELECT * FROM class_page_settings WHERE id = 1";
            $stmt = $this->db->execute($sql);
            $settings = $stmt->fetch();

            if (!$settings) {
                return $this->createDefault();
            }

            // Decode JSON pricing tiers
            if (isset($settings['pricing_tiers'])) {
                $settings['pricing_tiers'] = json_decode($settings['pricing_tiers'], true) ?: [];
            }

            return $settings;

        } catch (Exception $e) {
            throw new Exception('Failed to retrieve class page settings: ' . $e->getMessage());
        }
    }

    /**
     * Update settings
     */
    public function update($data) {
        try {
            $allowedFields = ['description', 'pricing_tiers', 'registration_fee'];
            $fields = [];
            $values = [];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    if ($field === 'pricing_tiers') {
                        $values[] = json_encode($data[$field]);
                    } else {
                        $values[] = $data[$field];
                    }
                }
            }

            if (empty($fields)) {
                throw new Exception('No valid fields to update');
            }

            $sql = "UPDATE class_page_settings SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = 1";
            $this->db->execute($sql, $values);

            return $this->getCurrent();

        } catch (Exception $e) {
            throw new Exception('Failed to update class page settings: ' . $e->getMessage());
        }
    }

    /**
     * Create default settings
     */
    private function createDefault() {
        try {
            $defaultDescription = 'We offer a variety of classes for all ages and skill levels. Our experienced instructors provide a fun, no-pressure atmosphere while teaching the fundamentals of gymnastics, social skills, and life skills.';
            $defaultPricingTiers = [
                ['duration' => '50 minute class', 'price' => '$69/month'],
                ['duration' => '55 minute class', 'price' => '$74/month'],
                ['duration' => '60 minute class', 'price' => '$82/month'],
                ['duration' => '90 minute class', 'price' => '$97/month']
            ];
            $defaultRegistrationFee = '$15 annual registration fee per person ($30 max per family)';

            $sql = "INSERT INTO class_page_settings (id, description, pricing_tiers, registration_fee)
                    VALUES (1, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE id = 1";

            $this->db->execute($sql, [
                $defaultDescription,
                json_encode($defaultPricingTiers),
                $defaultRegistrationFee
            ]);

            return $this->getCurrent();

        } catch (Exception $e) {
            throw new Exception('Failed to create default settings: ' . $e->getMessage());
        }
    }

    /**
     * Validate settings data
     */
    public function validateData($data) {
        $errors = [];

        if (isset($data['description'])) {
            if (empty(trim($data['description']))) {
                $errors['description'][] = 'Description cannot be empty';
            } elseif (strlen($data['description']) > 2000) {
                $errors['description'][] = 'Description must not exceed 2000 characters';
            }
        }

        if (isset($data['pricing_tiers'])) {
            if (!is_array($data['pricing_tiers'])) {
                $errors['pricing_tiers'][] = 'Pricing tiers must be an array';
            } else {
                foreach ($data['pricing_tiers'] as $index => $tier) {
                    if (empty($tier['duration'])) {
                        $errors['pricing_tiers'][] = "Tier $index: duration is required";
                    }
                    if (empty($tier['price'])) {
                        $errors['pricing_tiers'][] = "Tier $index: price is required";
                    }
                }
            }
        }

        if (isset($data['registration_fee'])) {
            if (strlen($data['registration_fee']) > 255) {
                $errors['registration_fee'][] = 'Registration fee must not exceed 255 characters';
            }
        }

        return $errors;
    }

    /**
     * Sanitize output
     */
    public function sanitizeOutput($data) {
        if (!is_array($data)) {
            return $data;
        }

        if (isset($data['description'])) {
            $data['description'] = htmlspecialchars_decode($data['description'], ENT_QUOTES);
        }

        if (isset($data['registration_fee'])) {
            $data['registration_fee'] = htmlspecialchars_decode($data['registration_fee'], ENT_QUOTES);
        }

        return $data;
    }

    /**
     * Check if user can edit settings
     */
    public function canEdit($userId, $userRole) {
        return in_array($userRole, ['admin', 'staff']);
    }
}
