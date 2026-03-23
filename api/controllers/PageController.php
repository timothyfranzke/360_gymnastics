<?php
/**
 * Page Controller
 * Handles HTTP requests for CMS page management
 */

class PageController extends BaseController {
    private $pageModel;
    private $pageImageModel;
    private $galleryModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->pageModel = new Page($database);
        $this->pageImageModel = new PageImage($database);
        $this->galleryModel = new Gallery($database);
    }

    /**
     * GET /pages - Get all pages with pagination and filters (admin)
     */
    public function index() {
        try {
            $pagination = $this->getPaginationParams();
            $searchParams = $this->getSearchParams();

            $filters = [
                'search' => $searchParams['search'],
                'sort_by' => $searchParams['sort_by'],
                'sort_order' => $searchParams['sort_order'],
                'is_published' => isset($_GET['is_published']) ? $_GET['is_published'] : null
            ];

            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            $total = $this->pageModel->getCount($filters);
            $pages = $this->pageModel->getAll($filters, $pagination);

            ResponseHelper::paginated(
                $pages,
                $total,
                $pagination['page'],
                $pagination['page_size'],
                'Pages retrieved successfully'
            );

        } catch (Exception $e) {
            error_log("Error in PageController::index: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve pages');
        }
    }

    /**
     * GET /pages/published - Public list of published pages (title + slug only)
     */
    public function published() {
        try {
            $pages = $this->pageModel->getPublished();
            ResponseHelper::success($pages, 'Published pages retrieved successfully');
        } catch (Exception $e) {
            error_log("Error in PageController::published: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve published pages');
        }
    }

    /**
     * GET /pages/{id} - Get page by ID (admin)
     */
    public function show($id) {
        try {
            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid page ID', 400);
                return;
            }

            $page = $this->pageModel->getById($id);

            if (!$page) {
                ResponseHelper::notFound('Page not found');
                return;
            }

            ResponseHelper::success($page, 'Page retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in PageController::show: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve page');
        }
    }

    /**
     * GET /pages/slug/{slug} - Get page by slug (public)
     */
    public function showBySlug($slug) {
        try {
            $page = $this->pageModel->getBySlug($slug);

            if (!$page) {
                ResponseHelper::notFound('Page not found');
                return;
            }

            // Resolve image URLs in content blocks
            $page['content'] = $this->resolveImageUrls($page['content']);

            ResponseHelper::success($page, 'Page retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in PageController::showBySlug: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve page');
        }
    }

    /**
     * POST /pages - Create new page
     */
    public function create() {
        try {
            $validationRules = [
                'title' => ['required', 'minLength' => 2, 'maxLength' => 255]
            ];

            $data = $this->validate($validationRules);
            if (!$data) return;

            // Auto-generate slug from title if not provided
            if (empty($data['slug'])) {
                $data['slug'] = $this->generateSlug($data['title']);
            } else {
                $data['slug'] = $this->sanitizeSlug($data['slug']);
            }

            // Check for duplicate slug
            if ($this->pageModel->slugExists($data['slug'])) {
                $data['slug'] = $data['slug'] . '-' . time();
            }

            // Ensure content is an array
            if (!isset($data['content']) || !is_array($data['content'])) {
                $data['content'] = [];
            }

            // Set created_by from auth
            $user = $this->getCurrentUser();
            $data['created_by'] = $user['user_id'] ?? null;

            $page = $this->pageModel->create($data);

            $this->logActivity('create_page', ['page_id' => $page['id'], 'title' => $page['title']]);
            ResponseHelper::created($page, 'Page created successfully');

        } catch (Exception $e) {
            error_log("Error in PageController::create: " . $e->getMessage());
            ResponseHelper::serverError('Failed to create page');
        }
    }

    /**
     * PUT /pages/{id} - Update page
     */
    public function update($id) {
        try {
            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid page ID', 400);
                return;
            }

            if (!$this->pageModel->exists($id)) {
                ResponseHelper::notFound('Page not found');
                return;
            }

            $validationRules = [
                'title' => ['minLength' => 2, 'maxLength' => 255]
            ];

            $data = $this->validate($validationRules);
            if (!$data) return;

            // Handle slug
            if (isset($data['slug'])) {
                $data['slug'] = $this->sanitizeSlug($data['slug']);
                if ($this->pageModel->slugExists($data['slug'], $id)) {
                    ResponseHelper::error('Slug already exists', 400);
                    return;
                }
            }

            $page = $this->pageModel->update($id, $data);

            $this->logActivity('update_page', ['page_id' => $id, 'updates' => array_keys($data)]);
            ResponseHelper::updated($page, 'Page updated successfully');

        } catch (Exception $e) {
            error_log("Error in PageController::update: " . $e->getMessage());
            ResponseHelper::serverError('Failed to update page');
        }
    }

    /**
     * DELETE /pages/{id} - Delete page and associated images
     */
    public function delete($id) {
        try {
            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid page ID', 400);
                return;
            }

            if (!$this->pageModel->exists($id)) {
                ResponseHelper::notFound('Page not found');
                return;
            }

            // Delete associated page images
            $this->pageImageModel->deleteByPageId($id);

            $success = $this->pageModel->delete($id);

            if ($success) {
                $this->logActivity('delete_page', ['page_id' => $id]);
                ResponseHelper::deleted('Page deleted successfully');
            } else {
                ResponseHelper::serverError('Failed to delete page');
            }

        } catch (Exception $e) {
            error_log("Error in PageController::delete: " . $e->getMessage());
            ResponseHelper::serverError('Failed to delete page');
        }
    }

    /**
     * PATCH /pages/{id}/toggle - Toggle published status
     */
    public function toggle($id) {
        try {
            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid page ID', 400);
                return;
            }

            $page = $this->pageModel->getById($id);
            if (!$page) {
                ResponseHelper::notFound('Page not found');
                return;
            }

            $updatedPage = $this->pageModel->togglePublished($id);

            $action = $updatedPage['is_published'] ? 'published' : 'unpublished';
            $this->logActivity('toggle_page', ['page_id' => $id, 'action' => $action]);

            ResponseHelper::updated($updatedPage, "Page $action successfully");

        } catch (Exception $e) {
            error_log("Error in PageController::toggle: " . $e->getMessage());
            ResponseHelper::serverError('Failed to toggle page status');
        }
    }

    /**
     * POST /pages/upload-image - Upload image for page blocks
     */
    public function uploadImage() {
        try {
            if (!isset($_FILES['image'])) {
                ResponseHelper::error('No image file provided', 400);
                return;
            }

            $result = FileUploadUtility::uploadPageImage($_FILES['image']);

            if (!$result['success']) {
                ResponseHelper::error(implode(', ', $result['errors']), 400);
                return;
            }

            // Save to page_images table
            $pageId = $_POST['page_id'] ?? null;
            $imageData = [
                'page_id' => $pageId,
                'filename' => $result['filename'],
                'original_filename' => $_FILES['image']['name'],
                'file_path' => $result['path'],
                'file_size' => $result['size'],
                'mime_type' => $_FILES['image']['type'],
                'dimensions_width' => $result['dimensions']['width'] ?? null,
                'dimensions_height' => $result['dimensions']['height'] ?? null
            ];

            $pageImage = $this->pageImageModel->create($imageData);

            $this->logActivity('upload_page_image', ['page_image_id' => $pageImage['id']]);
            ResponseHelper::created($pageImage, 'Image uploaded successfully');

        } catch (Exception $e) {
            error_log("Error in PageController::uploadImage: " . $e->getMessage());
            ResponseHelper::serverError('Failed to upload image');
        }
    }

    /**
     * GET /pages/stats - Get page statistics
     */
    public function stats() {
        try {
            $stats = $this->pageModel->getStats();
            ResponseHelper::success($stats, 'Page statistics retrieved successfully');
        } catch (Exception $e) {
            error_log("Error in PageController::stats: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve page statistics');
        }
    }

    /**
     * Generate URL-safe slug from title
     */
    private function generateSlug($title) {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        $slug = trim($slug, '-');
        return $slug;
    }

    /**
     * Sanitize an existing slug
     */
    private function sanitizeSlug($slug) {
        $slug = strtolower(trim($slug));
        $slug = preg_replace('/[^a-z0-9-]/', '', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');
        return $slug;
    }

    /**
     * Walk block tree and resolve image URLs
     */
    private function resolveImageUrls($blocks) {
        if (!is_array($blocks)) {
            return $blocks;
        }

        foreach ($blocks as &$block) {
            if (!isset($block['type'])) {
                continue;
            }

            if ($block['type'] === 'image' && isset($block['data'])) {
                $block['data'] = $this->resolveImageBlockData($block['data']);
            }

            if ($block['type'] === 'grid' && isset($block['data']['columns'])) {
                foreach ($block['data']['columns'] as &$column) {
                    if (isset($column['blocks'])) {
                        $column['blocks'] = $this->resolveImageUrls($column['blocks']);
                    }
                }
            }
        }

        return $blocks;
    }

    /**
     * Resolve a single image block's data
     */
    private function resolveImageBlockData($data) {
        if (!empty($data['gallery_id'])) {
            $galleryImage = $this->galleryModel->findById($data['gallery_id']);
            if ($galleryImage) {
                $data['url'] = $galleryImage['url'];
                $data['thumbnail_url'] = $galleryImage['thumbnail_url'];
            }
        } elseif (!empty($data['page_image_id'])) {
            $pageImage = $this->pageImageModel->getById($data['page_image_id']);
            if ($pageImage) {
                $data['url'] = $pageImage['url'];
                $data['thumbnail_url'] = $pageImage['thumbnail_url'];
            }
        }

        return $data;
    }
}
