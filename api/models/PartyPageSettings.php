<?php
/**
 * PartyPageSettings Model
 * Handles parties page settings (intro, footer note, packages)
 */

class PartyPageSettings {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function getCurrent() {
        try {
            $sql = "SELECT * FROM party_page_settings WHERE id = 1";
            $stmt = $this->db->execute($sql);
            $settings = $stmt->fetch();

            if (!$settings) {
                return $this->createDefault();
            }

            if (isset($settings['packages'])) {
                $settings['packages'] = json_decode($settings['packages'], true) ?: [];
            }

            return $settings;

        } catch (Exception $e) {
            throw new Exception('Failed to retrieve party page settings: ' . $e->getMessage());
        }
    }

    public function update($data) {
        try {
            $allowedFields = ['intro', 'footer_note', 'packages'];
            $fields = [];
            $values = [];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    if ($field === 'packages') {
                        $values[] = json_encode($this->normalizePackages($data[$field]));
                    } else {
                        $values[] = $data[$field];
                    }
                }
            }

            if (empty($fields)) {
                throw new Exception('No valid fields to update');
            }

            $sql = "UPDATE party_page_settings SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = 1";
            $this->db->execute($sql, $values);

            return $this->getCurrent();

        } catch (Exception $e) {
            throw new Exception('Failed to update party page settings: ' . $e->getMessage());
        }
    }

    /**
     * Renormalize display_order to be sequential 1..n and assign ids to new
     * packages so the admin form has a stable handle on each entry.
     */
    private function normalizePackages($packages) {
        if (!is_array($packages)) {
            return [];
        }

        usort($packages, function ($a, $b) {
            $aOrder = isset($a['display_order']) ? (int)$a['display_order'] : PHP_INT_MAX;
            $bOrder = isset($b['display_order']) ? (int)$b['display_order'] : PHP_INT_MAX;
            return $aOrder <=> $bOrder;
        });

        $maxId = 0;
        foreach ($packages as $pkg) {
            if (!empty($pkg['id']) && (int)$pkg['id'] > $maxId) {
                $maxId = (int)$pkg['id'];
            }
        }

        $normalized = [];
        $order = 1;
        foreach ($packages as $pkg) {
            $id = !empty($pkg['id']) ? (int)$pkg['id'] : ++$maxId;
            $normalized[] = [
                'id' => $id,
                'name' => isset($pkg['name']) ? (string)$pkg['name'] : '',
                'price' => isset($pkg['price']) ? (string)$pkg['price'] : '',
                'description' => isset($pkg['description']) ? (string)$pkg['description'] : '',
                'bullets' => isset($pkg['bullets']) && is_array($pkg['bullets'])
                    ? array_values(array_filter(array_map('strval', $pkg['bullets']), function ($b) {
                        return trim($b) !== '';
                    }))
                    : [],
                'display_order' => $order++,
                'active' => !empty($pkg['active'])
            ];
        }

        return $normalized;
    }

    private function createDefault() {
        try {
            $defaultIntro = '360 Gymnastics is a great place to have your next birthday party, school field trip, scouting event, or any other special event!';
            $defaultPackages = [];

            $sql = "INSERT INTO party_page_settings (id, intro, footer_note, packages)
                    VALUES (1, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE id = 1";

            $this->db->execute($sql, [
                $defaultIntro,
                '',
                json_encode($defaultPackages)
            ]);

            return $this->getCurrent();

        } catch (Exception $e) {
            throw new Exception('Failed to create default party page settings: ' . $e->getMessage());
        }
    }

    public function validateData($data) {
        $errors = [];

        if (isset($data['intro']) && strlen($data['intro']) > 2000) {
            $errors['intro'][] = 'Intro must not exceed 2000 characters';
        }

        if (isset($data['footer_note']) && strlen($data['footer_note']) > 2000) {
            $errors['footer_note'][] = 'Footer note must not exceed 2000 characters';
        }

        if (isset($data['packages'])) {
            if (!is_array($data['packages'])) {
                $errors['packages'][] = 'Packages must be an array';
            } else {
                foreach ($data['packages'] as $index => $pkg) {
                    if (empty(trim($pkg['name'] ?? ''))) {
                        $errors['packages'][] = "Package $index: name is required";
                    }
                    if (empty(trim($pkg['price'] ?? ''))) {
                        $errors['packages'][] = "Package $index: price is required";
                    }
                    if (isset($pkg['bullets']) && !is_array($pkg['bullets'])) {
                        $errors['packages'][] = "Package $index: bullets must be an array";
                    }
                }
            }
        }

        return $errors;
    }

    public function sanitizeOutput($data) {
        if (!is_array($data)) {
            return $data;
        }

        if (isset($data['intro'])) {
            $data['intro'] = htmlspecialchars_decode($data['intro'], ENT_QUOTES);
        }

        if (isset($data['footer_note'])) {
            $data['footer_note'] = htmlspecialchars_decode($data['footer_note'], ENT_QUOTES);
        }

        return $data;
    }

    public function getPublicView($settings) {
        $packages = isset($settings['packages']) && is_array($settings['packages']) ? $settings['packages'] : [];
        $activePackages = array_values(array_filter($packages, function ($pkg) {
            return !empty($pkg['active']);
        }));
        usort($activePackages, function ($a, $b) {
            $aOrder = isset($a['display_order']) ? (int)$a['display_order'] : PHP_INT_MAX;
            $bOrder = isset($b['display_order']) ? (int)$b['display_order'] : PHP_INT_MAX;
            return $aOrder <=> $bOrder;
        });

        return [
            'intro' => $settings['intro'] ?? '',
            'footer_note' => $settings['footer_note'] ?? '',
            'packages' => $activePackages
        ];
    }

    public function canEdit($userId, $userRole) {
        return in_array($userRole, ['admin', 'staff']);
    }
}
