<?php
/**
 * PageImage Model
 * Handles database operations for images uploaded within page blocks
 */

class PageImage {
    private $db;
    private $table = 'page_images';

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Create new page image record
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (page_id, filename, original_filename, file_path, file_size, mime_type, dimensions_width, dimensions_height, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $values = [
            $data['page_id'] ?? null,
            $data['filename'],
            $data['original_filename'] ?? null,
            $data['file_path'],
            $data['file_size'] ?? 0,
            $data['mime_type'],
            $data['dimensions_width'] ?? null,
            $data['dimensions_height'] ?? null
        ];

        $this->db->execute($query, $values);
        $id = $this->db->lastInsertId();

        return $this->getById($id);
    }

    /**
     * Get page image by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        $image = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($image) {
            $image = $this->formatUrls($image);
        }

        return $image;
    }

    /**
     * Get all images for a page
     */
    public function getByPageId($pageId) {
        $query = "SELECT * FROM {$this->table} WHERE page_id = ? ORDER BY created_at DESC";
        $stmt = $this->db->execute($query, [$pageId]);
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($images as &$image) {
            $image = $this->formatUrls($image);
        }

        return $images;
    }

    /**
     * Delete page image
     */
    public function delete($id) {
        $image = $this->getById($id);
        if (!$image) {
            return false;
        }

        // Delete physical files
        if (!empty($image['filename'])) {
            FileUploadUtility::deletePageImage($image['filename']);
        }

        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Delete all images for a page
     */
    public function deleteByPageId($pageId) {
        $images = $this->getByPageId($pageId);
        foreach ($images as $image) {
            if (!empty($image['filename'])) {
                FileUploadUtility::deletePageImage($image['filename']);
            }
        }

        $query = "DELETE FROM {$this->table} WHERE page_id = ?";
        $this->db->execute($query, [$pageId]);
    }

    /**
     * Check if page image exists
     */
    public function exists($id) {
        $query = "SELECT COUNT(*) FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Format image URLs
     */
    private function formatUrls($image) {
        if (!empty($image['filename'])) {
            $image['url'] = '/api/v1/files/pages/' . $image['filename'];
            $image['thumbnail_url'] = '/api/v1/files/pages/thumbnails/' . $image['filename'];
        } else {
            $image['url'] = null;
            $image['thumbnail_url'] = null;
        }
        return $image;
    }
}
