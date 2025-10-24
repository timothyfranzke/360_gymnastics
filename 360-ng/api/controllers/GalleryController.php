<?php
/**
 * Gallery Controller
 * Handles gallery image management operations
 */

class GalleryController extends BaseController {
    private $galleryModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->galleryModel = new Gallery($database);
    }

    /**
     * Get all gallery images
     * GET /api/v1/gallery
     * Public endpoint - no authentication required
     */
    public function index() {
        try {
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $featured_only = isset($_GET['featured']) && $_GET['featured'] === 'true';
            
            // Calculate offset from page if provided
            if ($page > 1 && $limit) {
                $offset = ($page - 1) * $limit;
            }
            
            $images = $this->galleryModel->getAll($limit, $offset, $featured_only);
            $stats = $this->galleryModel->getStats();
            
            ResponseHelper::success([
                'images' => $images,
                'total' => (int)$stats['total_images'],
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'offset' => $offset,
                    'total_pages' => $limit ? ceil($stats['total_images'] / $limit) : 1
                ]
            ], 'Gallery images retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve gallery images: ' . $e->getMessage());
        }
    }

    /**
     * Get single gallery image
     * GET /api/v1/gallery/{id}
     * Public endpoint - no authentication required
     */
    public function show($id) {
        try {
            $image = $this->galleryModel->findById($id);
            
            if (!$image) {
                ResponseHelper::notFound('Gallery image not found');
                return;
            }

            ResponseHelper::success([
                'image' => $image
            ], 'Gallery image retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve gallery image: ' . $e->getMessage());
        }
    }

    /**
     * Create new gallery image
     * POST /api/v1/gallery
     * Requires authentication
     */
    public function create() {
        try {
            $data = $this->getInput();
            
            // Validate required fields
            $requiredFields = ['filename', 'original_filename', 'file_path', 'mime_type'];
            $validation = Validator::validateRequired($data, $requiredFields);
            
            if (!$validation['valid']) {
                ResponseHelper::validationError($validation['errors']);
                return;
            }

            // Set uploaded_by if user is authenticated
            if (isset($_SESSION['user']['id'])) {
                $data['uploaded_by'] = $_SESSION['user']['id'];
            }

            // Set order index if not provided
            if (!isset($data['order_index'])) {
                $data['order_index'] = $this->galleryModel->getNextOrderIndex();
            }

            // Ensure boolean fields are properly converted to integers
            $data['is_featured'] = isset($data['is_featured']) && $data['is_featured'] ? 1 : 0;

            $image = $this->galleryModel->create($data);

            ResponseHelper::created([
                'image' => $image
            ], 'Gallery image created successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to create gallery image: ' . $e->getMessage());
        }
    }

    /**
     * Update gallery image
     * PUT/PATCH /api/v1/gallery/{id}
     * Requires authentication
     */
    public function update($id) {
        try {
            $image = $this->galleryModel->findById($id);
            
            if (!$image) {
                ResponseHelper::notFound('Gallery image not found');
                return;
            }

            $data = $this->getInput();
            
            if (empty($data)) {
                ResponseHelper::validationError(['general' => ['No data provided for update']]);
                return;
            }

            // Ensure boolean fields are properly converted to integers
            if (array_key_exists('is_featured', $data)) {
                $data['is_featured'] = $data['is_featured'] ? 1 : 0;
            }
            if (array_key_exists('is_active', $data)) {
                $data['is_active'] = $data['is_active'] ? 1 : 0;
            }

            $updatedImage = $this->galleryModel->update($id, $data);

            ResponseHelper::updated([
                'image' => $updatedImage
            ], 'Gallery image updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to update gallery image: ' . $e->getMessage());
        }
    }

    /**
     * Delete gallery image
     * DELETE /api/v1/gallery/{id}
     * Requires authentication
     */
    public function delete($id) {
        try {
            $image = $this->galleryModel->findById($id);
            
            if (!$image) {
                ResponseHelper::notFound('Gallery image not found');
                return;
            }

            $this->galleryModel->delete($id);

            ResponseHelper::deleted('Gallery image deleted successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to delete gallery image: ' . $e->getMessage());
        }
    }

    /**
     * Upload gallery image
     * POST /api/v1/gallery/upload
     * Requires authentication
     */
    public function upload() {
        try {
            // Check if file was uploaded
            if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
                ResponseHelper::validationError(['image' => ['Image file is required']]);
                return;
            }

            // Upload and process the file
            $result = FileUploadUtility::uploadGalleryImage($_FILES['image']);

            if (!$result['success']) {
                ResponseHelper::validationError(['image' => $result['errors']]);
                return;
            }

            // Create gallery record
            $imageData = [
                'filename' => $result['filename'],
                'original_filename' => $_FILES['image']['name'],
                'file_path' => $result['path'],
                'file_size' => $result['size'],
                'mime_type' => $_FILES['image']['type'],
                'dimensions_width' => $result['dimensions']['width'] ?? null,
                'dimensions_height' => $result['dimensions']['height'] ?? null,
                'alt_text' => $_POST['alt_text'] ?? null,
                'caption' => $_POST['caption'] ?? null,
                'order_index' => $_POST['order_index'] ?? $this->galleryModel->getNextOrderIndex(),
                'is_featured' => isset($_POST['is_featured']) && $_POST['is_featured'] === 'true' ? 1 : 0,
                'uploaded_by' => $_SESSION['user']['id'] ?? null
            ];

            $image = $this->galleryModel->create($imageData);

            ResponseHelper::created([
                'image' => $image,
                'upload_info' => [
                    'original_url' => $result['url'],
                    'thumbnail_url' => $result['thumbnail_url'],
                    'size' => $result['size'],
                    'dimensions' => $result['dimensions']
                ]
            ], 'Gallery image uploaded successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to upload gallery image: ' . $e->getMessage());
        }
    }

    /**
     * Update image order
     * POST /api/v1/gallery/reorder
     * Requires authentication
     */
    public function reorder() {
        try {
            $data = $this->getInput();
            
            if (!isset($data['image_orders']) || !is_array($data['image_orders'])) {
                ResponseHelper::validationError(['image_orders' => ['Image orders array is required']]);
                return;
            }

            $this->galleryModel->updateOrder($data['image_orders']);

            ResponseHelper::success([], 'Image order updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to update image order: ' . $e->getMessage());
        }
    }

    /**
     * Get gallery statistics
     * GET /api/v1/gallery/stats
     * Requires authentication
     */
    public function stats() {
        try {
            $stats = $this->galleryModel->getStats();

            ResponseHelper::success([
                'stats' => $stats
            ], 'Gallery statistics retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve gallery statistics: ' . $e->getMessage());
        }
    }

    /**
     * Get featured images only
     * GET /api/v1/gallery/featured
     * Public endpoint - no authentication required
     */
    public function featured() {
        try {
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
            $images = $this->galleryModel->getAll($limit, 0, true);

            ResponseHelper::success([
                'images' => $images,
                'total' => count($images)
            ], 'Featured gallery images retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve featured gallery images: ' . $e->getMessage());
        }
    }

    /**
     * Clean up sample data (remove non-GUID filenames)
     * POST /api/v1/gallery/cleanup
     * Requires authentication
     */
    public function cleanup() {
        try {
            // Log that we're starting the cleanup
            error_log("Starting gallery cleanup process");
            
            // Check if gallery model exists
            if (!$this->galleryModel) {
                throw new Exception("Gallery model not initialized");
            }
            
            $cleanupResult = $this->galleryModel->cleanupSampleData();
            
            // Log the cleanup result
            error_log("Gallery cleanup completed: " . json_encode($cleanupResult));
            
            ResponseHelper::success([
                'cleanup' => $cleanupResult
            ], 'Gallery cleanup completed successfully');

        } catch (Exception $e) {
            // Log the full error details
            error_log("Gallery cleanup error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            ResponseHelper::serverError('Failed to cleanup gallery: ' . $e->getMessage());
        }
    }
}