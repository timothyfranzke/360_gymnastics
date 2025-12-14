<?php

class FaqController extends BaseController {
    
    public function __construct($database) {
        parent::__construct($database);
    }

    public function index() {
        try {
            $category = isset($_GET['category']) ? trim($_GET['category']) : '';
            $active_only = isset($_GET['active_only']) ? filter_var($_GET['active_only'], FILTER_VALIDATE_BOOLEAN) : true;
            
            $whereConditions = [];
            $params = [];
            
            if (!empty($category)) {
                $whereConditions[] = "category = ?";
                $params[] = $category;
            }
            
            if ($active_only) {
                $whereConditions[] = "is_active = true";
            }
            
            $whereClause = empty($whereConditions) ? '' : 'WHERE ' . implode(' AND ', $whereConditions);
            
            $sql = "SELECT * FROM faqs $whereClause ORDER BY display_order ASC, created_at ASC";
            $stmt = $this->db->execute($sql, $params);
            $faqs = $stmt->fetchAll();
            
            ResponseHelper::success($faqs, 'FAQs retrieved successfully');
            
        } catch (Exception $e) {
            error_log("Get FAQs error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve FAQs');
        }
    }

    public function show($id) {
        try {
            if (empty($id) || !is_numeric($id)) {
                ResponseHelper::badRequest('Invalid FAQ ID');
                return;
            }
            
            $sql = "SELECT * FROM faqs WHERE id = ?";
            $stmt = $this->db->execute($sql, [$id]);
            $result = $stmt->fetchAll();
            
            if (empty($result)) {
                ResponseHelper::notFound('FAQ not found');
                return;
            }
            
            ResponseHelper::success($result[0], 'FAQ retrieved successfully');
            
        } catch (Exception $e) {
            error_log("Get FAQ error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve FAQ');
        }
    }

    public function create() {
        $rules = [
            'question' => ['required', 'maxLength' => 1000],
            'answer' => ['required', 'maxLength' => 5000],
            'category' => ['maxLength' => 100],
            'display_order' => ['numeric'],
            'is_active' => ['boolean']
        ];

        $data = $this->validate($rules);
        if (!$data) {
            return;
        }

        try {
            $faqData = [
                'question' => trim($data['question']),
                'answer' => trim($data['answer']),
                'category' => isset($data['category']) ? trim($data['category']) : 'General',
                'display_order' => isset($data['display_order']) ? intval($data['display_order']) : 0,
                'is_active' => isset($data['is_active']) ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN) : true
            ];

            $sql = "INSERT INTO faqs (question, answer, category, display_order, is_active) VALUES (?, ?, ?, ?, ?)";
            $this->db->execute($sql, [
                $faqData['question'],
                $faqData['answer'],
                $faqData['category'],
                $faqData['display_order'],
                $faqData['is_active']
            ]);
            
            $id = $this->db->lastInsertId();
            $faqData['id'] = $id;
            
            ResponseHelper::success($faqData, 'FAQ created successfully');

        } catch (Exception $e) {
            error_log("Create FAQ error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to create FAQ');
        }
    }

    public function update($id) {
        try {
            if (empty($id) || !is_numeric($id)) {
                ResponseHelper::badRequest('Invalid FAQ ID');
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                ResponseHelper::badRequest('Invalid JSON data');
                return;
            }
            
            // Check if FAQ exists
            $checkSql = "SELECT id FROM faqs WHERE id = ?";
            $stmt = $this->db->execute($checkSql, [$id]);
            $exists = $stmt->fetchAll();
            
            if (empty($exists)) {
                ResponseHelper::notFound('FAQ not found');
                return;
            }
            
            $updateFields = [];
            $params = [];
            
            if (isset($input['question']) && !empty(trim($input['question']))) {
                $updateFields[] = "question = ?";
                $params[] = trim($input['question']);
            }
            
            if (isset($input['answer']) && !empty(trim($input['answer']))) {
                $updateFields[] = "answer = ?";
                $params[] = trim($input['answer']);
            }
            
            if (isset($input['category'])) {
                $updateFields[] = "category = ?";
                $params[] = !empty(trim($input['category'])) ? trim($input['category']) : 'General';
            }
            
            if (isset($input['display_order'])) {
                $updateFields[] = "display_order = ?";
                $params[] = intval($input['display_order']);
            }
            
            if (isset($input['is_active'])) {
                $updateFields[] = "is_active = ?";
                $params[] = filter_var($input['is_active'], FILTER_VALIDATE_BOOLEAN);
            }
            
            if (empty($updateFields)) {
                ResponseHelper::badRequest('No valid fields to update');
                return;
            }
            
            $params[] = $id;
            $sql = "UPDATE faqs SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $this->db->execute($sql, $params);
            
            // Return updated FAQ
            $updatedSql = "SELECT * FROM faqs WHERE id = ?";
            $stmt = $this->db->execute($updatedSql, [$id]);
            $updatedFaq = $stmt->fetchAll()[0];
            
            ResponseHelper::success($updatedFaq, 'FAQ updated successfully');
            
        } catch (Exception $e) {
            error_log("Update FAQ error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to update FAQ');
        }
    }

    public function delete($id) {
        try {
            if (empty($id) || !is_numeric($id)) {
                ResponseHelper::badRequest('Invalid FAQ ID');
                return;
            }
            
            // Check if FAQ exists
            $checkSql = "SELECT id FROM faqs WHERE id = ?";
            $stmt = $this->db->execute($checkSql, [$id]);
            $exists = $stmt->fetchAll();
            
            if (empty($exists)) {
                ResponseHelper::notFound('FAQ not found');
                return;
            }
            
            $sql = "DELETE FROM faqs WHERE id = ?";
            $this->db->execute($sql, [$id]);
            
            ResponseHelper::success(['id' => $id], 'FAQ deleted successfully');
            
        } catch (Exception $e) {
            error_log("Delete FAQ error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to delete FAQ');
        }
    }

    public function toggle($id) {
        try {
            if (empty($id) || !is_numeric($id)) {
                ResponseHelper::badRequest('Invalid FAQ ID');
                return;
            }
            
            // Check if FAQ exists and get current status
            $checkSql = "SELECT id, is_active FROM faqs WHERE id = ?";
            $stmt = $this->db->execute($checkSql, [$id]);
            $faq = $stmt->fetchAll();
            
            if (empty($faq)) {
                ResponseHelper::notFound('FAQ not found');
                return;
            }
            
            $newStatus = !$faq[0]['is_active'];
            
            $sql = "UPDATE faqs SET is_active = ? WHERE id = ?";
            $this->db->execute($sql, [$newStatus, $id]);
            
            ResponseHelper::success([
                'id' => $id, 
                'is_active' => $newStatus
            ], 'FAQ status toggled successfully');
            
        } catch (Exception $e) {
            error_log("Toggle FAQ error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to toggle FAQ');
        }
    }

    public function getCategories() {
        try {
            $sql = "SELECT DISTINCT category FROM faqs WHERE is_active = true ORDER BY category";
            $stmt = $this->db->execute($sql);
            $categories = $stmt->fetchAll();
            
            $categoryList = array_column($categories, 'category');
            
            ResponseHelper::success($categoryList, 'FAQ categories retrieved successfully');
            
        } catch (Exception $e) {
            error_log("Get FAQ categories error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve FAQ categories');
        }
    }

    public function stats() {
        try {
            $totalSql = "SELECT COUNT(*) as total FROM faqs";
            $activeSql = "SELECT COUNT(*) as active FROM faqs WHERE is_active = true";
            $categoriesSql = "SELECT COUNT(DISTINCT category) as categories FROM faqs";
            
            $totalStmt = $this->db->execute($totalSql);
            $total = $totalStmt->fetchColumn();
            
            $activeStmt = $this->db->execute($activeSql);
            $active = $activeStmt->fetchColumn();
            
            $categoriesStmt = $this->db->execute($categoriesSql);
            $categories = $categoriesStmt->fetchColumn();
            
            ResponseHelper::success([
                'total' => intval($total),
                'active' => intval($active),
                'inactive' => intval($total - $active),
                'categories' => intval($categories)
            ], 'FAQ stats retrieved successfully');
            
        } catch (Exception $e) {
            error_log("Get FAQ stats error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve FAQ stats');
        }
    }
}