<?php
/**
 * ScreenImages Controller
 * Handles screen image assignment operations
 */

class ScreenImagesController extends BaseController {
    private $screenImageModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->screenImageModel = new ScreenImage($database);
    }

    /**
     * Get screen images for a specific screen
     * GET /api/v1/screen-images?screen={screenKey}
     * Public endpoint - no authentication required
     */
    public function index() {
        try {
            $screenKey = isset($_GET['screen']) ? trim($_GET['screen']) : null;

            if (!$screenKey) {
                // Return all assignments (admin view)
                $assignments = $this->screenImageModel->getAll();
                ResponseHelper::success([
                    'assignments' => $assignments
                ], 'All screen image assignments retrieved successfully');
                return;
            }

            $assignments = $this->screenImageModel->getByScreen($screenKey);

            // Convert to keyed object for easier frontend access
            $images = [];
            foreach ($assignments as $assignment) {
                $images[$assignment['position_key']] = [
                    'id' => $assignment['id'],
                    'gallery_id' => $assignment['gallery_id'],
                    'url' => $assignment['url'],
                    'thumbnail_url' => $assignment['thumbnail_url'],
                    'alt_text' => $assignment['alt_text'],
                    'caption' => $assignment['caption']
                ];
            }

            ResponseHelper::success([
                'screen' => $screenKey,
                'images' => $images,
                'placeholder_url' => '/assets/images/placeholder.jpg'
            ], 'Screen images retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve screen images: ' . $e->getMessage());
        }
    }

    /**
     * Get single assignment
     * GET /api/v1/screen-images/{id}
     */
    public function show($id) {
        try {
            $assignment = $this->screenImageModel->findById($id);

            if (!$assignment) {
                ResponseHelper::notFound('Screen image assignment not found');
                return;
            }

            ResponseHelper::success([
                'assignment' => $assignment
            ], 'Screen image assignment retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve screen image: ' . $e->getMessage());
        }
    }

    /**
     * Assign image to screen position
     * POST /api/v1/screen-images
     * Requires authentication
     */
    public function assign() {
        try {
            // Validate required fields
            $data = $this->validate([
                'screen_key' => ['required'],
                'position_key' => ['required'],
                'gallery_id' => ['required', 'integer']
            ]);

            if (!$data) {
                return; // Validation failed, response already sent
            }

            // Set created_by if user is authenticated
            $user = $this->getCurrentUser();
            if ($user && isset($user['user_id'])) {
                $data['created_by'] = $user['user_id'];
            }

            $assignment = $this->screenImageModel->assign($data);

            ResponseHelper::created([
                'assignment' => $assignment
            ], 'Image assigned to screen position successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to assign screen image: ' . $e->getMessage());
        }
    }

    /**
     * Remove screen image assignment
     * DELETE /api/v1/screen-images/{id}
     * Requires authentication
     */
    public function remove($id) {
        try {
            $assignment = $this->screenImageModel->findById($id);

            if (!$assignment) {
                ResponseHelper::notFound('Screen image assignment not found');
                return;
            }

            $this->screenImageModel->remove($id);

            ResponseHelper::deleted('Screen image assignment removed successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to remove screen image: ' . $e->getMessage());
        }
    }

    /**
     * Get available screen positions
     * GET /api/v1/screen-images/positions
     */
    public function positions() {
        try {
            $positions = $this->screenImageModel->getAvailablePositions();

            ResponseHelper::success([
                'positions' => $positions
            ], 'Available screen positions retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve screen positions: ' . $e->getMessage());
        }
    }

    /**
     * Get assignments for a specific gallery image
     * GET /api/v1/screen-images/gallery/{galleryId}
     */
    public function byGallery($galleryId) {
        try {
            $assignments = $this->screenImageModel->getByGalleryId($galleryId);

            ResponseHelper::success([
                'gallery_id' => (int)$galleryId,
                'assignments' => $assignments
            ], 'Gallery image assignments retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve gallery assignments: ' . $e->getMessage());
        }
    }
}
