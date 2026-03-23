<?php
/**
 * Base Controller
 * Provides common functionality for all controllers
 */

abstract class BaseController {
    protected $db;
    protected $validator;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get request input data
     */
    protected function getInput() {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            // If JSON decode fails, try to get form data
            $data = $_POST;
        }
        
        // Merge with GET parameters
        return array_merge($_GET, $data ?: []);
    }

    /**
     * Validate input data
     */
    protected function validate($rules, $data = null) {
        $data = $data ?: $this->getInput();
        $this->validator = new Validator($data);
        
        foreach ($rules as $field => $fieldRules) {
            foreach ($fieldRules as $rule => $params) {
                if (is_numeric($rule)) {
                    // Simple rule without parameters
                    $this->validator->{$params}($field);
                } else {
                    // Rule with parameters
                    if (is_array($params)) {
                        $this->validator->{$rule}($field, ...$params);
                    } else {
                        $this->validator->{$rule}($field, $params);
                    }
                }
            }
        }
        
        if (!$this->validator->isValid()) {
            ResponseHelper::validationError($this->validator->getErrors());
            return false;
        }
        
        return $data;
    }

    /**
     * Get pagination parameters
     */
    protected function getPaginationParams() {
        $page = max(1, intval($_GET['page'] ?? 1));
        $pageSize = min(MAX_PAGE_SIZE, max(1, intval($_GET['page_size'] ?? DEFAULT_PAGE_SIZE)));
        $offset = ($page - 1) * $pageSize;
        
        return [
            'page' => $page,
            'page_size' => $pageSize,
            'offset' => $offset
        ];
    }

    /**
     * Get search and filter parameters
     */
    protected function getSearchParams() {
        return [
            'search' => $_GET['search'] ?? '',
            'sort_by' => $_GET['sort_by'] ?? 'created_at',
            'sort_order' => strtoupper($_GET['sort_order'] ?? 'DESC'),
            'filter' => $_GET['filter'] ?? []
        ];
    }

    /**
     * Build search query conditions
     */
    protected function buildSearchConditions($searchFields, $params) {
        $conditions = [];
        $values = [];
        
        if (!empty($params['search'])) {
            $searchConditions = [];
            foreach ($searchFields as $field) {
                $searchConditions[] = "$field LIKE ?";
                $values[] = '%' . $params['search'] . '%';
            }
            if (!empty($searchConditions)) {
                $conditions[] = '(' . implode(' OR ', $searchConditions) . ')';
            }
        }
        
        return [
            'conditions' => $conditions,
            'values' => $values
        ];
    }

    /**
     * Build ORDER BY clause
     */
    protected function buildOrderClause($allowedFields, $params) {
        $sortBy = $params['sort_by'];
        $sortOrder = in_array($params['sort_order'], ['ASC', 'DESC']) ? $params['sort_order'] : 'DESC';
        
        if (in_array($sortBy, $allowedFields)) {
            return "ORDER BY $sortBy $sortOrder";
        }
        
        return "ORDER BY created_at DESC";
    }

    /**
     * Execute paginated query
     */
    protected function executePaginatedQuery($baseQuery, $conditions, $values, $pagination) {
        // Count total records
        $countQuery = str_replace('SELECT *', 'SELECT COUNT(*)', $baseQuery);
        if (!empty($conditions)) {
            $countQuery .= ' WHERE ' . implode(' AND ', $conditions);
        }
        
        $countStmt = $this->db->execute($countQuery, $values);
        $total = $countStmt->fetchColumn();
        
        // Get paginated results
        $dataQuery = $baseQuery;
        if (!empty($conditions)) {
            $dataQuery .= ' WHERE ' . implode(' AND ', $conditions);
        }
        $dataQuery .= " LIMIT {$pagination['page_size']} OFFSET {$pagination['offset']}";
        
        $dataStmt = $this->db->execute($dataQuery, $values);
        $data = $dataStmt->fetchAll();
        
        return [
            'data' => $data,
            'total' => $total
        ];
    }

    /**
     * Get current user from session
     */
    protected function getCurrentUser() {
        return AuthMiddleware::getCurrentUser();
    }

    /**
     * Check if user has permission
     */
    protected function hasRole($role) {
        return AuthMiddleware::hasRole($role);
    }

    /**
     * Require specific role
     */
    protected function requireRole($role) {
        return AuthMiddleware::requireRole($role);
    }

    /**
     * Sanitize output data
     */
    protected function sanitizeOutput($data) {
        if (is_array($data)) {
            return array_map([$this, 'sanitizeOutput'], $data);
        }
        
        if (is_string($data)) {
            return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        }
        
        return $data;
    }

    /**
     * Log activity
     */
    protected function logActivity($action, $details = null) {
        $user = $this->getCurrentUser();
        $userId = $user['user_id'] ?? null;
        
        // You can implement activity logging here
        error_log("[API Activity] User: $userId, Action: $action, Details: " . json_encode($details));
    }
}