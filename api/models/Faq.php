<?php
/**
 * FAQ Model
 * Handles FAQ data operations
 */

class Faq {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get all FAQs with pagination and filtering
     */
    public function getAll($pagination, $filters = []) {
        $baseQuery = "SELECT f.*, c.name as category_name, c.slug as category_slug,
                             u.first_name, u.last_name
                      FROM faqs f
                      LEFT JOIN faq_categories c ON f.category_id = c.id
                      LEFT JOIN users u ON f.created_by = u.id";

        $conditions = [];
        $values = [];

        // Active filter
        if (isset($filters['is_active'])) {
            $conditions[] = "f.is_active = ?";
            $values[] = $filters['is_active'] ? 1 : 0;
        }

        // Category filter
        if (!empty($filters['category_id'])) {
            $conditions[] = "f.category_id = ?";
            $values[] = $filters['category_id'];
        }

        // Search filter
        if (!empty($filters['search'])) {
            $conditions[] = "(f.question LIKE ? OR f.answer LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $values[] = $searchTerm;
            $values[] = $searchTerm;
        }

        $query = $baseQuery;
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }

        // Count total
        $countQuery = str_replace(
            'SELECT f.*, c.name as category_name, c.slug as category_slug, u.first_name, u.last_name',
            'SELECT COUNT(*)',
            $query
        );
        $countStmt = $this->db->execute($countQuery, $values);
        $total = $countStmt->fetchColumn();

        // Add sorting
        $sortField = $filters['sort_by'] ?? 'display_order';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'ASC');
        $allowedSortFields = ['question', 'display_order', 'created_at', 'category_name'];

        if (in_array($sortField, $allowedSortFields)) {
            if ($sortField === 'category_name') {
                $query .= " ORDER BY c.name $sortOrder, f.display_order ASC";
            } else {
                $query .= " ORDER BY f.$sortField $sortOrder";
            }
        } else {
            $query .= " ORDER BY c.display_order ASC, f.display_order ASC";
        }

        // Add pagination
        $query .= " LIMIT {$pagination['page_size']} OFFSET {$pagination['offset']}";

        $stmt = $this->db->execute($query, $values);
        $faqs = $stmt->fetchAll();

        return [
            'faqs' => $faqs,
            'total' => $total
        ];
    }

    /**
     * Get active FAQs grouped by category (for public display)
     */
    public function getActiveGroupedByCategory() {
        $sql = "SELECT f.id, f.question, f.answer, f.display_order,
                       c.id as category_id, c.name as category_name, c.slug as category_slug,
                       c.display_order as category_order
                FROM faqs f
                INNER JOIN faq_categories c ON f.category_id = c.id
                WHERE f.is_active = 1 AND c.is_active = 1
                ORDER BY c.display_order ASC, f.display_order ASC";

        $stmt = $this->db->execute($sql);
        $faqs = $stmt->fetchAll();

        // Group by category
        $grouped = [];
        foreach ($faqs as $faq) {
            $categorySlug = $faq['category_slug'];
            if (!isset($grouped[$categorySlug])) {
                $grouped[$categorySlug] = [
                    'id' => $faq['category_id'],
                    'name' => $faq['category_name'],
                    'slug' => $categorySlug,
                    'faqs' => []
                ];
            }
            $grouped[$categorySlug]['faqs'][] = [
                'id' => $faq['id'],
                'question' => $faq['question'],
                'answer' => $faq['answer'],
                'display_order' => $faq['display_order']
            ];
        }

        return array_values($grouped);
    }

    /**
     * Get FAQs by category slug
     */
    public function getByCategorySlug($slug, $activeOnly = true) {
        $sql = "SELECT f.id, f.question, f.answer, f.display_order, f.is_active
                FROM faqs f
                INNER JOIN faq_categories c ON f.category_id = c.id
                WHERE c.slug = ?";

        $params = [$slug];

        if ($activeOnly) {
            $sql .= " AND f.is_active = 1 AND c.is_active = 1";
        }

        $sql .= " ORDER BY f.display_order ASC";

        $stmt = $this->db->execute($sql, $params);
        return $stmt->fetchAll();
    }

    /**
     * Search FAQs
     */
    public function search($searchTerm, $limit = 20) {
        $sql = "SELECT f.id, f.question, f.answer, f.display_order,
                       c.name as category_name, c.slug as category_slug
                FROM faqs f
                INNER JOIN faq_categories c ON f.category_id = c.id
                WHERE f.is_active = 1 AND c.is_active = 1
                  AND (f.question LIKE ? OR f.answer LIKE ?)
                ORDER BY
                    CASE WHEN f.question LIKE ? THEN 0 ELSE 1 END,
                    f.display_order ASC
                LIMIT ?";

        $searchPattern = '%' . $searchTerm . '%';
        $stmt = $this->db->execute($sql, [
            $searchPattern, $searchPattern, $searchPattern, $limit
        ]);

        return $stmt->fetchAll();
    }

    /**
     * Find FAQ by ID
     */
    public function findById($id) {
        $sql = "SELECT f.*, c.name as category_name, c.slug as category_slug
                FROM faqs f
                LEFT JOIN faq_categories c ON f.category_id = c.id
                WHERE f.id = ?";

        $stmt = $this->db->execute($sql, [$id]);
        return $stmt->fetch();
    }

    /**
     * Create FAQ
     */
    public function create($data) {
        $sql = "INSERT INTO faqs (category_id, question, answer, display_order, is_active, created_by)
                VALUES (?, ?, ?, ?, ?, ?)";

        $this->db->execute($sql, [
            $data['category_id'],
            $data['question'],
            $data['answer'],
            $data['display_order'] ?? $this->getNextOrderIndex($data['category_id']),
            $data['is_active'] ?? 1,
            $data['created_by'] ?? null
        ]);

        return $this->findById($this->db->lastInsertId());
    }

    /**
     * Update FAQ
     */
    public function update($id, $data) {
        $allowedFields = ['category_id', 'question', 'answer', 'display_order', 'is_active'];
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
        $sql = "UPDATE faqs SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        $this->db->execute($sql, $values);
        return $this->findById($id);
    }

    /**
     * Delete FAQ
     */
    public function delete($id) {
        $sql = "DELETE FROM faqs WHERE id = ?";
        $this->db->execute($sql, [$id]);
        return true;
    }

    /**
     * Toggle active status
     */
    public function toggleActive($id) {
        $sql = "UPDATE faqs SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $this->db->execute($sql, [$id]);
        return $this->findById($id);
    }

    /**
     * Update display order for multiple FAQs
     */
    public function updateOrder($orders) {
        foreach ($orders as $id => $order) {
            $sql = "UPDATE faqs SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            $this->db->execute($sql, [$order, $id]);
        }
        return true;
    }

    /**
     * Get next order index for category
     */
    public function getNextOrderIndex($categoryId) {
        $sql = "SELECT COALESCE(MAX(display_order), 0) + 1 as next_order
                FROM faqs WHERE category_id = ?";
        $stmt = $this->db->execute($sql, [$categoryId]);
        $result = $stmt->fetch();
        return $result['next_order'];
    }

    /**
     * Get statistics
     */
    public function getStats() {
        $sql = "SELECT
                    COUNT(*) as total_faqs,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_faqs,
                    (SELECT COUNT(*) FROM faq_categories) as total_categories,
                    (SELECT COUNT(*) FROM faq_categories WHERE is_active = 1) as active_categories
                FROM faqs";

        $stmt = $this->db->execute($sql);
        return $stmt->fetch();
    }
}
