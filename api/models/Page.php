<?php
/**
 * Page Model
 * Handles database operations for CMS pages
 */

class Page {
    private $db;
    private $table = 'pages';

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get all pages with optional filters
     */
    public function getAll($filters = [], $pagination = []) {
        $baseQuery = "SELECT * FROM {$this->table}";
        $conditions = [];
        $values = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(title LIKE ? OR slug LIKE ?)";
            $values[] = '%' . $filters['search'] . '%';
            $values[] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['is_published']) && $filters['is_published'] !== '') {
            $conditions[] = "is_published = ?";
            $values[] = $filters['is_published'] ? 1 : 0;
        }

        // Build ORDER BY clause
        $allowedSortFields = ['title', 'slug', 'created_at', 'updated_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $allowedSortFields) ? $filters['sort_by'] : 'updated_at';
        $sortOrder = in_array($filters['sort_order'] ?? '', ['ASC', 'DESC']) ? $filters['sort_order'] : 'DESC';
        $orderBy = "ORDER BY $sortBy $sortOrder";

        $query = $baseQuery;
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }
        $query .= " " . $orderBy;

        if (!empty($pagination)) {
            $query .= " LIMIT {$pagination['page_size']} OFFSET {$pagination['offset']}";
        }

        $stmt = $this->db->execute($query, $values);
        $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode JSON content for each page
        foreach ($pages as &$page) {
            $page['content'] = json_decode($page['content'], true) ?: [];
            $page['is_published'] = (bool) $page['is_published'];
        }

        return $pages;
    }

    /**
     * Get total count with filters
     */
    public function getCount($filters = []) {
        $query = "SELECT COUNT(*) FROM {$this->table}";
        $conditions = [];
        $values = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(title LIKE ? OR slug LIKE ?)";
            $values[] = '%' . $filters['search'] . '%';
            $values[] = '%' . $filters['search'] . '%';
        }

        if (isset($filters['is_published']) && $filters['is_published'] !== '') {
            $conditions[] = "is_published = ?";
            $values[] = $filters['is_published'] ? 1 : 0;
        }

        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }

        $stmt = $this->db->execute($query, $values);
        return $stmt->fetchColumn();
    }

    /**
     * Get published pages (public endpoint — title + slug only)
     */
    public function getPublished() {
        $query = "SELECT id, title, slug FROM {$this->table} WHERE is_published = 1 ORDER BY title ASC";
        $stmt = $this->db->execute($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get page by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        $page = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($page) {
            $page['content'] = json_decode($page['content'], true) ?: [];
            $page['is_published'] = (bool) $page['is_published'];
        }

        return $page;
    }

    /**
     * Get page by slug
     */
    public function getBySlug($slug) {
        $query = "SELECT * FROM {$this->table} WHERE slug = ? AND is_published = 1";
        $stmt = $this->db->execute($query, [$slug]);
        $page = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($page) {
            $page['content'] = json_decode($page['content'], true) ?: [];
            $page['is_published'] = (bool) $page['is_published'];
        }

        return $page;
    }

    /**
     * Create new page
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (title, slug, content, is_published, created_by, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, NOW(), NOW())";

        $values = [
            $data['title'],
            $data['slug'],
            json_encode($data['content'] ?? []),
            $data['is_published'] ?? 0,
            $data['created_by'] ?? null
        ];

        $this->db->execute($query, $values);
        $id = $this->db->lastInsertId();

        return $this->getById($id);
    }

    /**
     * Update page
     */
    public function update($id, $data) {
        $fields = [];
        $values = [];

        $allowedFields = ['title', 'slug', 'is_published'];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        // Handle content separately (needs JSON encoding)
        if (array_key_exists('content', $data)) {
            $fields[] = "content = ?";
            $values[] = json_encode($data['content']);
        }

        if (empty($fields)) {
            throw new Exception('No valid fields to update');
        }

        $fields[] = "updated_at = NOW()";
        $values[] = $id;

        $query = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $this->db->execute($query, $values);

        return $this->getById($id);
    }

    /**
     * Delete page
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Check if page exists
     */
    public function exists($id) {
        $query = "SELECT COUNT(*) FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Check if slug exists (optionally excluding a page ID)
     */
    public function slugExists($slug, $excludeId = null) {
        $query = "SELECT COUNT(*) FROM {$this->table} WHERE slug = ?";
        $values = [$slug];

        if ($excludeId) {
            $query .= " AND id != ?";
            $values[] = $excludeId;
        }

        $stmt = $this->db->execute($query, $values);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Get page statistics
     */
    public function getStats() {
        $stats = [];

        $stmt = $this->db->execute("SELECT COUNT(*) FROM {$this->table}");
        $stats['total'] = (int) $stmt->fetchColumn();

        $stmt = $this->db->execute("SELECT COUNT(*) FROM {$this->table} WHERE is_published = 1");
        $stats['published'] = (int) $stmt->fetchColumn();

        $stats['draft'] = $stats['total'] - $stats['published'];

        return $stats;
    }

    /**
     * Toggle published status
     */
    public function togglePublished($id) {
        $page = $this->getById($id);
        if (!$page) {
            return false;
        }

        $newStatus = $page['is_published'] ? 0 : 1;
        $query = "UPDATE {$this->table} SET is_published = ?, updated_at = NOW() WHERE id = ?";
        $this->db->execute($query, [$newStatus, $id]);

        return $this->getById($id);
    }
}
