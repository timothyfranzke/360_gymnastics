<?php
/**
 * FAQ Category Model
 * Handles FAQ category data operations
 */

class FaqCategory {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get all categories with optional active filter
     */
    public function getAll($activeOnly = true) {
        $sql = "SELECT id, name, slug, description, display_order, is_active, created_at, updated_at
                FROM faq_categories";

        if ($activeOnly) {
            $sql .= " WHERE is_active = 1";
        }

        $sql .= " ORDER BY display_order ASC, name ASC";

        $stmt = $this->db->execute($sql);
        return $stmt->fetchAll();
    }

    /**
     * Get categories with FAQ count
     */
    public function getAllWithCounts($activeOnly = true) {
        $sql = "SELECT c.*,
                       COUNT(CASE WHEN f.is_active = 1 THEN f.id END) as active_faq_count,
                       COUNT(f.id) as total_faq_count
                FROM faq_categories c
                LEFT JOIN faqs f ON c.id = f.category_id";

        if ($activeOnly) {
            $sql .= " WHERE c.is_active = 1";
        }

        $sql .= " GROUP BY c.id ORDER BY c.display_order ASC, c.name ASC";

        $stmt = $this->db->execute($sql);
        return $stmt->fetchAll();
    }

    /**
     * Find category by ID
     */
    public function findById($id) {
        $sql = "SELECT * FROM faq_categories WHERE id = ?";
        $stmt = $this->db->execute($sql, [$id]);
        return $stmt->fetch();
    }

    /**
     * Find category by slug
     */
    public function findBySlug($slug) {
        $sql = "SELECT * FROM faq_categories WHERE slug = ?";
        $stmt = $this->db->execute($sql, [$slug]);
        return $stmt->fetch();
    }

    /**
     * Create category
     */
    public function create($data) {
        $sql = "INSERT INTO faq_categories (name, slug, description, display_order, is_active)
                VALUES (?, ?, ?, ?, ?)";

        $this->db->execute($sql, [
            $data['name'],
            $data['slug'],
            $data['description'] ?? null,
            $data['display_order'] ?? $this->getNextOrderIndex(),
            $data['is_active'] ?? 1
        ]);

        return $this->findById($this->db->lastInsertId());
    }

    /**
     * Update category
     */
    public function update($id, $data) {
        $allowedFields = ['name', 'slug', 'description', 'display_order', 'is_active'];
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
        $sql = "UPDATE faq_categories SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        $this->db->execute($sql, $values);
        return $this->findById($id);
    }

    /**
     * Delete category
     */
    public function delete($id) {
        $sql = "DELETE FROM faq_categories WHERE id = ?";
        $this->db->execute($sql, [$id]);
        return true;
    }

    /**
     * Toggle active status
     */
    public function toggleActive($id) {
        $sql = "UPDATE faq_categories SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $this->db->execute($sql, [$id]);
        return $this->findById($id);
    }

    /**
     * Update display order for multiple categories
     */
    public function updateOrder($orders) {
        foreach ($orders as $id => $order) {
            $sql = "UPDATE faq_categories SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            $this->db->execute($sql, [$order, $id]);
        }
        return true;
    }

    /**
     * Get next order index
     */
    public function getNextOrderIndex() {
        $sql = "SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM faq_categories";
        $stmt = $this->db->execute($sql);
        $result = $stmt->fetch();
        return $result['next_order'];
    }

    /**
     * Check if slug exists
     */
    public function slugExists($slug, $excludeId = null) {
        $sql = "SELECT COUNT(*) as count FROM faq_categories WHERE slug = ?";
        $params = [$slug];

        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }

        $stmt = $this->db->execute($sql, $params);
        $result = $stmt->fetch();
        return $result['count'] > 0;
    }
}
