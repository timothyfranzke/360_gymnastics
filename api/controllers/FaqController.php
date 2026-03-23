<?php
/**
 * FAQ Controller
 * Handles FAQ CRUD operations and public FAQ retrieval
 */

class FaqController extends BaseController {
    private $faqModel;
    private $categoryModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->faqModel = new Faq($database);
        $this->categoryModel = new FaqCategory($database);
    }

    /**
     * Simple auth check - just requires user to be logged in
     */
    private function requireAuth() {
        $user = $this->getCurrentUser();
        if (!$user) {
            ResponseHelper::unauthorized('Authentication required');
            return false;
        }
        return true;
    }

    // ========== PUBLIC FAQ ENDPOINTS ==========

    /**
     * Get all active FAQs grouped by category (public)
     * GET /api/v1/faqs
     */
    public function index() {
        try {
            $faqs = $this->faqModel->getActiveGroupedByCategory();

            ResponseHelper::success([
                'categories' => $faqs
            ], 'FAQs retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve FAQs: ' . $e->getMessage());
        }
    }

    /**
     * Get FAQs by category slug (public)
     * GET /api/v1/faqs/category/{slug}
     */
    public function byCategory($slug) {
        try {
            $category = $this->categoryModel->findBySlug($slug);

            if (!$category || !$category['is_active']) {
                ResponseHelper::notFound('Category not found');
                return;
            }

            $faqs = $this->faqModel->getByCategorySlug($slug);

            ResponseHelper::success([
                'category' => $category,
                'faqs' => $faqs
            ], 'FAQs retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve FAQs: ' . $e->getMessage());
        }
    }

    /**
     * Search FAQs (public)
     * GET /api/v1/faqs/search?q={query}
     */
    public function search() {
        try {
            $query = $_GET['q'] ?? '';

            if (strlen($query) < 2) {
                ResponseHelper::error('Search query must be at least 2 characters', 400);
                return;
            }

            $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
            $faqs = $this->faqModel->search($query, $limit);

            ResponseHelper::success([
                'faqs' => $faqs,
                'query' => $query
            ], 'Search results retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to search FAQs: ' . $e->getMessage());
        }
    }

    /**
     * Get single FAQ (public)
     * GET /api/v1/faqs/{id}
     */
    public function show($id) {
        try {
            $faq = $this->faqModel->findById($id);

            if (!$faq) {
                ResponseHelper::notFound('FAQ not found');
                return;
            }

            ResponseHelper::success([
                'faq' => $faq
            ], 'FAQ retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve FAQ: ' . $e->getMessage());
        }
    }

    // ========== ADMIN FAQ ENDPOINTS ==========

    /**
     * Get all FAQs for admin (with pagination)
     * GET /api/v1/faqs/all
     */
    public function all() {
        if (!$this->requireAuth()) return;

        try {
            $pagination = $this->getPaginationParams();
            $search = $this->getSearchParams();

            $filters = [
                'search' => $search['search'],
                'category_id' => $_GET['category_id'] ?? null,
                'is_active' => isset($_GET['is_active']) ? filter_var($_GET['is_active'], FILTER_VALIDATE_BOOLEAN) : null,
                'sort_by' => $search['sort_by'],
                'sort_order' => $search['sort_order']
            ];

            $result = $this->faqModel->getAll($pagination, $filters);

            ResponseHelper::paginated(
                $result['faqs'],
                $result['total'],
                $pagination['page'],
                $pagination['page_size'],
                'FAQs retrieved successfully'
            );

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve FAQs: ' . $e->getMessage());
        }
    }

    /**
     * Get FAQ statistics
     * GET /api/v1/faqs/stats
     */
    public function stats() {
        if (!$this->requireAuth()) return;

        try {
            $stats = $this->faqModel->getStats();

            ResponseHelper::success([
                'stats' => $stats
            ], 'FAQ statistics retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve FAQ statistics: ' . $e->getMessage());
        }
    }

    /**
     * Create FAQ
     * POST /api/v1/faqs
     */
    public function create() {
        if (!$this->requireAuth()) return;

        $data = $this->validate([
            'category_id' => ['required', 'numeric'],
            'question' => ['required', 'maxLength' => [500]],
            'answer' => ['required'],
            'display_order' => ['numeric'],
            'is_active' => ['boolean']
        ]);

        if (!$data) return;

        // Verify category exists
        $category = $this->categoryModel->findById($data['category_id']);
        if (!$category) {
            ResponseHelper::error('Category not found', 400);
            return;
        }

        try {
            $currentUser = $this->getCurrentUser();
            $data['created_by'] = $currentUser['user_id'];

            $faq = $this->faqModel->create($data);

            $this->logActivity('faq_created', [
                'faq_id' => $faq['id'],
                'question' => $faq['question']
            ]);

            ResponseHelper::created([
                'faq' => $faq
            ], 'FAQ created successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to create FAQ: ' . $e->getMessage());
        }
    }

    /**
     * Update FAQ
     * PUT /api/v1/faqs/{id}
     */
    public function update($id) {
        if (!$this->requireAuth()) return;

        $faq = $this->faqModel->findById($id);
        if (!$faq) {
            ResponseHelper::notFound('FAQ not found');
            return;
        }

        $data = $this->validate([
            'category_id' => ['numeric'],
            'question' => ['maxLength' => [500]],
            'answer' => [],
            'display_order' => ['numeric'],
            'is_active' => ['boolean']
        ]);

        if (!$data) return;

        // Verify category if being changed
        if (isset($data['category_id'])) {
            $category = $this->categoryModel->findById($data['category_id']);
            if (!$category) {
                ResponseHelper::error('Category not found', 400);
                return;
            }
        }

        try {
            $updatedFaq = $this->faqModel->update($id, $data);

            $this->logActivity('faq_updated', [
                'faq_id' => $id,
                'updated_fields' => array_keys($data)
            ]);

            ResponseHelper::updated([
                'faq' => $updatedFaq
            ], 'FAQ updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to update FAQ: ' . $e->getMessage());
        }
    }

    /**
     * Delete FAQ
     * DELETE /api/v1/faqs/{id}
     */
    public function delete($id) {
        if (!$this->requireAuth()) return;

        $faq = $this->faqModel->findById($id);
        if (!$faq) {
            ResponseHelper::notFound('FAQ not found');
            return;
        }

        try {
            $this->faqModel->delete($id);

            $this->logActivity('faq_deleted', [
                'faq_id' => $id,
                'question' => $faq['question']
            ]);

            ResponseHelper::deleted('FAQ deleted successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to delete FAQ: ' . $e->getMessage());
        }
    }

    /**
     * Toggle FAQ active status
     * PATCH /api/v1/faqs/{id}/toggle
     */
    public function toggle($id) {
        if (!$this->requireAuth()) return;

        $faq = $this->faqModel->findById($id);
        if (!$faq) {
            ResponseHelper::notFound('FAQ not found');
            return;
        }

        try {
            $updatedFaq = $this->faqModel->toggleActive($id);

            $this->logActivity('faq_toggled', [
                'faq_id' => $id,
                'new_status' => $updatedFaq['is_active'] ? 'active' : 'inactive'
            ]);

            ResponseHelper::updated([
                'faq' => $updatedFaq
            ], 'FAQ status updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to toggle FAQ status: ' . $e->getMessage());
        }
    }

    /**
     * Reorder FAQs
     * POST /api/v1/faqs/reorder
     */
    public function reorder() {
        if (!$this->requireAuth()) return;

        $data = $this->getInput();

        if (empty($data['orders']) || !is_array($data['orders'])) {
            ResponseHelper::error('Orders array is required', 400);
            return;
        }

        try {
            $this->faqModel->updateOrder($data['orders']);

            $this->logActivity('faqs_reordered', [
                'count' => count($data['orders'])
            ]);

            ResponseHelper::success(null, 'FAQs reordered successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to reorder FAQs: ' . $e->getMessage());
        }
    }

    // ========== PUBLIC CATEGORY ENDPOINTS ==========

    /**
     * Get all active categories (public)
     * GET /api/v1/faq-categories
     */
    public function categories() {
        try {
            $categories = $this->categoryModel->getAllWithCounts(true);

            ResponseHelper::success([
                'categories' => $categories
            ], 'Categories retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve categories: ' . $e->getMessage());
        }
    }

    /**
     * Get single category
     * GET /api/v1/faq-categories/{id}
     */
    public function showCategory($id) {
        try {
            $category = $this->categoryModel->findById($id);

            if (!$category) {
                ResponseHelper::notFound('Category not found');
                return;
            }

            ResponseHelper::success([
                'category' => $category
            ], 'Category retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve category: ' . $e->getMessage());
        }
    }

    // ========== ADMIN CATEGORY ENDPOINTS ==========

    /**
     * Get all categories for admin
     * GET /api/v1/faq-categories/all
     */
    public function allCategories() {
        if (!$this->requireAuth()) return;

        try {
            $categories = $this->categoryModel->getAllWithCounts(false);

            ResponseHelper::success([
                'categories' => $categories
            ], 'Categories retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve categories: ' . $e->getMessage());
        }
    }

    /**
     * Create category
     * POST /api/v1/faq-categories
     */
    public function createCategory() {
        if (!$this->requireAuth()) return;

        $data = $this->validate([
            'name' => ['required', 'maxLength' => [100]],
            'slug' => ['required', 'maxLength' => [100]],
            'description' => [],
            'display_order' => ['numeric'],
            'is_active' => ['boolean']
        ]);

        if (!$data) return;

        // Check slug uniqueness
        if ($this->categoryModel->slugExists($data['slug'])) {
            ResponseHelper::error('Slug already exists', 400);
            return;
        }

        try {
            $category = $this->categoryModel->create($data);

            $this->logActivity('faq_category_created', [
                'category_id' => $category['id'],
                'name' => $category['name']
            ]);

            ResponseHelper::created([
                'category' => $category
            ], 'Category created successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to create category: ' . $e->getMessage());
        }
    }

    /**
     * Update category
     * PUT /api/v1/faq-categories/{id}
     */
    public function updateCategory($id) {
        if (!$this->requireAuth()) return;

        $category = $this->categoryModel->findById($id);
        if (!$category) {
            ResponseHelper::notFound('Category not found');
            return;
        }

        $data = $this->validate([
            'name' => ['maxLength' => [100]],
            'slug' => ['maxLength' => [100]],
            'description' => [],
            'display_order' => ['numeric'],
            'is_active' => ['boolean']
        ]);

        if (!$data) return;

        // Check slug uniqueness if being changed
        if (isset($data['slug']) && $this->categoryModel->slugExists($data['slug'], $id)) {
            ResponseHelper::error('Slug already exists', 400);
            return;
        }

        try {
            $updatedCategory = $this->categoryModel->update($id, $data);

            $this->logActivity('faq_category_updated', [
                'category_id' => $id,
                'updated_fields' => array_keys($data)
            ]);

            ResponseHelper::updated([
                'category' => $updatedCategory
            ], 'Category updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to update category: ' . $e->getMessage());
        }
    }

    /**
     * Delete category
     * DELETE /api/v1/faq-categories/{id}
     */
    public function deleteCategory($id) {
        if (!$this->requireAuth()) return;

        $category = $this->categoryModel->findById($id);
        if (!$category) {
            ResponseHelper::notFound('Category not found');
            return;
        }

        try {
            $this->categoryModel->delete($id);

            $this->logActivity('faq_category_deleted', [
                'category_id' => $id,
                'name' => $category['name']
            ]);

            ResponseHelper::deleted('Category deleted successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to delete category: ' . $e->getMessage());
        }
    }

    /**
     * Toggle category active status
     * PATCH /api/v1/faq-categories/{id}/toggle
     */
    public function toggleCategory($id) {
        if (!$this->requireAuth()) return;

        $category = $this->categoryModel->findById($id);
        if (!$category) {
            ResponseHelper::notFound('Category not found');
            return;
        }

        try {
            $updatedCategory = $this->categoryModel->toggleActive($id);

            $this->logActivity('faq_category_toggled', [
                'category_id' => $id,
                'new_status' => $updatedCategory['is_active'] ? 'active' : 'inactive'
            ]);

            ResponseHelper::updated([
                'category' => $updatedCategory
            ], 'Category status updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to toggle category status: ' . $e->getMessage());
        }
    }

    /**
     * Reorder categories
     * POST /api/v1/faq-categories/reorder
     */
    public function reorderCategories() {
        if (!$this->requireAuth()) return;

        $data = $this->getInput();

        if (empty($data['orders']) || !is_array($data['orders'])) {
            ResponseHelper::error('Orders array is required', 400);
            return;
        }

        try {
            $this->categoryModel->updateOrder($data['orders']);

            $this->logActivity('faq_categories_reordered', [
                'count' => count($data['orders'])
            ]);

            ResponseHelper::success(null, 'Categories reordered successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to reorder categories: ' . $e->getMessage());
        }
    }
}
