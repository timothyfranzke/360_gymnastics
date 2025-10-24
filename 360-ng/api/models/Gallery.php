<?php
/**
 * Gallery Model
 * Handles gallery image data operations
 */

class Gallery {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get all gallery images
     */
    public function getAll($limit = null, $offset = 0, $featured_only = false) {
        $sql = "SELECT id, filename, original_filename, alt_text, caption, file_path, 
                       file_size, mime_type, dimensions_width, dimensions_height, 
                       order_index, is_featured, is_active, created_at 
                FROM gallery";
        
        $whereConditions = [];
        
        if ($featured_only) {
            $whereConditions[] = "is_featured = 1";
        }
        
        // Only show images with GUID filenames (filter out sample data)
        // GUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.ext
        $whereConditions[] = "filename REGEXP '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.'";
        
        // For admin interface, show all images (including inactive)
        // If you want to filter active only, uncomment the next line:
        // $whereConditions[] = "is_active = 1";
        
        if (!empty($whereConditions)) {
            $sql .= " WHERE " . implode(" AND ", $whereConditions);
        }
        
        $sql .= " ORDER BY order_index ASC, created_at DESC";
        
        $params = [];
        if ($limit) {
            $sql .= " LIMIT ? OFFSET ?";
            $params = [$limit, $offset];
        }
        
        $stmt = $this->db->execute($sql, $params);
        $images = $stmt->fetchAll();
        
        // Format URLs for each image
        foreach ($images as &$image) {
            $image = $this->formatImageUrls($image);
        }
        
        return $images;
    }

    /**
     * Get gallery image by ID
     */
    public function findById($id) {
        $sql = "SELECT id, filename, original_filename, alt_text, caption, file_path, 
                       file_size, mime_type, dimensions_width, dimensions_height, 
                       order_index, is_featured, is_active, created_at, updated_at 
                FROM gallery 
                WHERE id = ?";
        
        $stmt = $this->db->execute($sql, [$id]);
        $image = $stmt->fetch();
        
        if ($image) {
            $image = $this->formatImageUrls($image);
        }
        
        return $image;
    }

    /**
     * Create new gallery image
     */
    public function create($imageData) {
        try {
            $sql = "INSERT INTO gallery (filename, original_filename, alt_text, caption, 
                                       file_path, file_size, mime_type, dimensions_width, 
                                       dimensions_height, order_index, is_featured, uploaded_by) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $this->db->execute($sql, [
                $imageData['filename'],
                $imageData['original_filename'],
                $imageData['alt_text'] ?? null,
                $imageData['caption'] ?? null,
                $imageData['file_path'],
                $imageData['file_size'] ?? 0,
                $imageData['mime_type'],
                $imageData['dimensions_width'] ?? null,
                $imageData['dimensions_height'] ?? null,
                $imageData['order_index'] ?? 0,
                $imageData['is_featured'] ?? 0,
                $imageData['uploaded_by'] ?? null
            ]);

            $imageId = $this->db->lastInsertId();
            return $this->findById($imageId);

        } catch (Exception $e) {
            throw new Exception('Failed to create gallery image: ' . $e->getMessage());
        }
    }

    /**
     * Update gallery image
     */
    public function update($id, $imageData) {
        try {
            $updateFields = [];
            $params = [];
            
            $allowedFields = [
                'alt_text', 'caption', 'order_index', 'is_featured', 'is_active'
            ];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $imageData)) {
                    $updateFields[] = "{$field} = ?";
                    $params[] = $imageData[$field];
                }
            }
            
            if (empty($updateFields)) {
                throw new Exception('No valid fields provided for update');
            }
            
            $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
            $params[] = $id;
            
            $sql = "UPDATE gallery SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $this->db->execute($sql, $params);
            
            return $this->findById($id);

        } catch (Exception $e) {
            throw new Exception('Failed to update gallery image: ' . $e->getMessage());
        }
    }

    /**
     * Delete gallery image
     */
    public function delete($id) {
        try {
            $image = $this->findById($id);
            if (!$image) {
                throw new Exception('Gallery image not found');
            }

            // Delete associated files
            if (!empty($image['filename'])) {
                FileUploadUtility::deleteGalleryImage($image['filename']);
            }

            // Delete database record
            $this->db->execute("DELETE FROM gallery WHERE id = ?", [$id]);
            
            return true;

        } catch (Exception $e) {
            throw new Exception('Failed to delete gallery image: ' . $e->getMessage());
        }
    }

    /**
     * Get gallery statistics
     */
    public function getStats() {
        $sql = "SELECT 
                    COUNT(*) as total_images,
                    COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_images,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_images,
                    SUM(file_size) as total_size
                FROM gallery
                WHERE filename REGEXP '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.'";
        
        $stmt = $this->db->execute($sql);
        return $stmt->fetch();
    }

    /**
     * Update image order
     */
    public function updateOrder($imageOrders) {
        try {
            $this->db->beginTransaction();
            
            foreach ($imageOrders as $imageId => $orderIndex) {
                $sql = "UPDATE gallery SET order_index = ? WHERE id = ?";
                $this->db->execute($sql, [$orderIndex, $imageId]);
            }
            
            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollback();
            throw new Exception('Failed to update image order: ' . $e->getMessage());
        }
    }

    /**
     * Get next order index
     */
    public function getNextOrderIndex() {
        $sql = "SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM gallery";
        $stmt = $this->db->execute($sql);
        $result = $stmt->fetch();
        return $result['next_order'];
    }

    /**
     * Format image URLs to include full API endpoints
     */
    private function formatImageUrls($image) {
        if (!empty($image['filename'])) {
            $filename = $image['filename'];
            
            // Create full URLs for gallery images
            $image['url'] = '/api/v1/files/gallery/' . $filename;
            $image['thumbnail_url'] = '/api/v1/files/gallery/thumbnails/' . $filename;
        } else {
            $image['url'] = null;
            $image['thumbnail_url'] = null;
        }
        
        return $image;
    }

    /**
     * Check if filename exists
     */
    public function filenameExists($filename) {
        $sql = "SELECT COUNT(*) as count FROM gallery WHERE filename = ?";
        $stmt = $this->db->execute($sql, [$filename]);
        $result = $stmt->fetch();
        return $result['count'] > 0;
    }

    /**
     * Clean up sample data (remove non-GUID filenames)
     */
    public function cleanupSampleData() {
        try {
            // Count current images
            $stmt = $this->db->execute("SELECT COUNT(*) as count FROM gallery");
            $result = $stmt->fetch();
            $currentCount = $result['count'];
            
            // First, get list of sample data to verify what we're deleting
            $stmt = $this->db->execute("SELECT id, filename FROM gallery WHERE filename LIKE 'gallery-%'");
            $sampleImages = $stmt->fetchAll();
            
            $deletedCount = 0;
            
            // Delete each sample image individually for better error handling
            foreach ($sampleImages as $image) {
                try {
                    $this->db->execute("DELETE FROM gallery WHERE id = ?", [$image['id']]);
                    $deletedCount++;
                } catch (Exception $e) {
                    // Log individual deletion errors but continue
                    error_log("Failed to delete gallery image {$image['id']}: " . $e->getMessage());
                }
            }
            
            // Count remaining images
            $stmt = $this->db->execute("SELECT COUNT(*) as count FROM gallery");
            $result = $stmt->fetch();
            $remainingCount = $result['count'];
            
            return [
                'original_count' => $currentCount,
                'deleted_count' => $deletedCount,
                'remaining_count' => $remainingCount,
                'sample_images_found' => count($sampleImages)
            ];
            
        } catch (Exception $e) {
            throw new Exception('Failed to cleanup sample data: ' . $e->getMessage());
        }
    }
}