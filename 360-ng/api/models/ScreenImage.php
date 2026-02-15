<?php
/**
 * ScreenImage Model
 * Handles screen image assignment operations
 */

class ScreenImage {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get all screen image assignments for a specific screen
     */
    public function getByScreen($screenKey) {
        $sql = "SELECT
                    si.id,
                    si.screen_key,
                    si.position_key,
                    si.gallery_id,
                    si.is_active,
                    si.created_at,
                    g.filename,
                    g.original_filename,
                    g.alt_text,
                    g.caption,
                    g.file_path,
                    g.mime_type
                FROM screen_images si
                INNER JOIN gallery g ON si.gallery_id = g.id
                WHERE si.screen_key = ? AND si.is_active = 1 AND g.is_active = 1
                ORDER BY si.position_key ASC";

        $stmt = $this->db->execute($sql, [$screenKey]);
        $assignments = $stmt->fetchAll();

        // Format URLs for each image
        foreach ($assignments as &$assignment) {
            $assignment = $this->formatImageUrls($assignment);
        }

        return $assignments;
    }

    /**
     * Get all screen image assignments (for admin)
     */
    public function getAll() {
        $sql = "SELECT
                    si.id,
                    si.screen_key,
                    si.position_key,
                    si.gallery_id,
                    si.is_active,
                    si.created_at,
                    g.filename,
                    g.original_filename,
                    g.alt_text,
                    g.caption,
                    g.thumbnail_url
                FROM screen_images si
                INNER JOIN gallery g ON si.gallery_id = g.id
                ORDER BY si.screen_key ASC, si.position_key ASC";

        $stmt = $this->db->execute($sql);
        $assignments = $stmt->fetchAll();

        // Format URLs for each image
        foreach ($assignments as &$assignment) {
            $assignment = $this->formatImageUrls($assignment);
        }

        return $assignments;
    }

    /**
     * Get a specific assignment by ID
     */
    public function findById($id) {
        $sql = "SELECT
                    si.id,
                    si.screen_key,
                    si.position_key,
                    si.gallery_id,
                    si.is_active,
                    si.created_at,
                    si.updated_at,
                    g.filename,
                    g.original_filename,
                    g.alt_text,
                    g.caption,
                    g.file_path,
                    g.mime_type
                FROM screen_images si
                INNER JOIN gallery g ON si.gallery_id = g.id
                WHERE si.id = ?";

        $stmt = $this->db->execute($sql, [$id]);
        $assignment = $stmt->fetch();

        if ($assignment) {
            $assignment = $this->formatImageUrls($assignment);
        }

        return $assignment;
    }

    /**
     * Assign an image to a screen position
     * Uses REPLACE to handle upsert (insert or update)
     */
    public function assign($data) {
        try {
            // Check if assignment already exists
            $existingId = $this->findByScreenPosition($data['screen_key'], $data['position_key']);

            if ($existingId) {
                // Update existing assignment
                $sql = "UPDATE screen_images
                        SET gallery_id = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?";
                $this->db->execute($sql, [
                    $data['gallery_id'],
                    $existingId
                ]);
                return $this->findById($existingId);
            } else {
                // Create new assignment
                $sql = "INSERT INTO screen_images (screen_key, position_key, gallery_id, is_active, created_by)
                        VALUES (?, ?, ?, 1, ?)";

                $this->db->execute($sql, [
                    $data['screen_key'],
                    $data['position_key'],
                    $data['gallery_id'],
                    $data['created_by'] ?? null
                ]);

                $id = $this->db->lastInsertId();
                return $this->findById($id);
            }
        } catch (Exception $e) {
            throw new Exception('Failed to assign screen image: ' . $e->getMessage());
        }
    }

    /**
     * Remove a screen image assignment
     */
    public function remove($id) {
        try {
            $assignment = $this->findById($id);
            if (!$assignment) {
                throw new Exception('Screen image assignment not found');
            }

            $this->db->execute("DELETE FROM screen_images WHERE id = ?", [$id]);
            return true;
        } catch (Exception $e) {
            throw new Exception('Failed to remove screen image: ' . $e->getMessage());
        }
    }

    /**
     * Remove assignment by screen and position
     */
    public function removeByScreenPosition($screenKey, $positionKey) {
        try {
            $this->db->execute(
                "DELETE FROM screen_images WHERE screen_key = ? AND position_key = ?",
                [$screenKey, $positionKey]
            );
            return true;
        } catch (Exception $e) {
            throw new Exception('Failed to remove screen image: ' . $e->getMessage());
        }
    }

    /**
     * Find assignment ID by screen and position
     */
    private function findByScreenPosition($screenKey, $positionKey) {
        $sql = "SELECT id FROM screen_images WHERE screen_key = ? AND position_key = ?";
        $stmt = $this->db->execute($sql, [$screenKey, $positionKey]);
        $result = $stmt->fetch();
        return $result ? $result['id'] : null;
    }

    /**
     * Get all assignments for a gallery image
     */
    public function getByGalleryId($galleryId) {
        $sql = "SELECT id, screen_key, position_key, is_active, created_at
                FROM screen_images
                WHERE gallery_id = ?
                ORDER BY screen_key ASC, position_key ASC";

        $stmt = $this->db->execute($sql, [$galleryId]);
        return $stmt->fetchAll();
    }

    /**
     * Get list of available screen positions
     */
    public function getAvailablePositions() {
        return [
            'parties' => [
                ['key' => 'parties-1', 'label' => 'Private Party Image'],
                ['key' => 'parties-2', 'label' => 'Open Gym Party Image']
            ],
            'camps' => [
                ['key' => 'camps-1', 'label' => 'Camps Hero Image'],
                ['key' => 'camps-2', 'label' => 'Camps Section Image']
            ],
            'home' => [
                ['key' => 'home-1', 'label' => 'Home Featured Image 1'],
                ['key' => 'home-2', 'label' => 'Home Featured Image 2'],
                ['key' => 'home-3', 'label' => 'Home Featured Image 3']
            ]
        ];
    }

    /**
     * Format image URLs
     */
    private function formatImageUrls($assignment) {
        if (!empty($assignment['filename'])) {
            $filename = $assignment['filename'];
            $assignment['url'] = '/api/v1/files/gallery/' . $filename;
            $assignment['thumbnail_url'] = '/api/v1/files/gallery/thumbnails/' . $filename;
        } else {
            $assignment['url'] = null;
            $assignment['thumbnail_url'] = null;
        }

        return $assignment;
    }
}
