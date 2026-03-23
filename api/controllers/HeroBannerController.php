<?php
/**
 * HeroBanner Controller
 * Handles hero banner CRUD operations and display management
 */

class HeroBannerController extends BaseController {
    private $heroBannerModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->heroBannerModel = new HeroBanner($database);
    }

    /**
     * Get current banner configuration
     * GET /api/v1/hero-banner
     */
    public function index() {
        try {
            $banner = $this->heroBannerModel->getCurrent();
            $sanitizedBanner = $this->heroBannerModel->sanitizeOutput($banner);
            
            // Map fields to match Angular interface
            if (isset($sanitizedBanner['message'])) {
                $sanitizedBanner['text'] = $sanitizedBanner['message'];
                unset($sanitizedBanner['message']);
            }

            ResponseHelper::success($sanitizedBanner, 'Banner configuration retrieved successfully');

        } catch (Exception $e) {
            error_log("HeroBanner::index - " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve banner configuration: ' . $e->getMessage());
        }
    }

    /**
     * Get current banner for public display (no authentication required)
     * GET /api/v1/banner/public
     */
    public function publicBanner() {
        try {
            $banner = $this->heroBannerModel->getCurrent();
            
            // Only return essential fields for public consumption
            $publicBanner = [
                'id' => $banner['id'] ?? 0,
                'text' => $banner['message'] ?? 'Enrolling for 2025!',
                'is_visible' => (bool)($banner['is_visible'] ?? true),
                'background_color' => $banner['background_color'] ?? '#fc7900',
                'created_at' => $banner['created_at'] ?? '',
                'updated_at' => $banner['updated_at'] ?? ''
            ];

            $sanitizedBanner = $this->heroBannerModel->sanitizeOutput($publicBanner);

            ResponseHelper::success($sanitizedBanner, 'Public banner retrieved successfully');

        } catch (Exception $e) {
            error_log("HeroBanner::publicBanner - " . $e->getMessage());
            // For public endpoint, return default banner on error
            ResponseHelper::success([
                'id' => 0,
                'text' => 'Enrolling for 2025!',
                'is_visible' => true,
                'background_color' => '#fc7900',
                'created_at' => '',
                'updated_at' => ''
            ], 'Default banner retrieved');
        }
    }

    /**
     * Update banner configuration
     * PUT /api/v1/hero-banner
     */
    public function update() {
        try {
            // Check permissions
            $user = $this->getCurrentUser();
            if (!$user) {
                ResponseHelper::unauthorized('Authentication required');
                return;
            }

            if (!$this->heroBannerModel->canEdit($user['user_id'], $user['role'])) {
                ResponseHelper::forbidden('Insufficient permissions to edit banner');
                return;
            }

            // Get and validate input
            $data = $this->getInput();
            
            // Map 'text' field to 'message' for backend compatibility
            if (isset($data['text'])) {
                $data['message'] = $data['text'];
                unset($data['text']);
            }
            
            // Custom validation for banner data
            $validationErrors = $this->heroBannerModel->validateData($data);
            if (!empty($validationErrors)) {
                ResponseHelper::validationError($validationErrors);
                return;
            }

            // Additional validation using the base validator
            $rules = [
                'message' => ['maxLength' => [500]],
                'background_color' => ['regex' => ['/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', 'Invalid hex color format']],
                'text_color' => ['regex' => ['/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', 'Invalid hex color format']]
            ];

            $validatedData = $this->validate($rules, $data);
            if ($validatedData === false) {
                return; // Validation errors already handled
            }

            // Convert string boolean values to actual booleans
            if (isset($validatedData['is_visible'])) {
                $validatedData['is_visible'] = filter_var($validatedData['is_visible'], FILTER_VALIDATE_BOOLEAN);
            }

            // Update banner
            $updatedBanner = $this->heroBannerModel->update($validatedData, $user['user_id']);
            $sanitizedBanner = $this->heroBannerModel->sanitizeOutput($updatedBanner);

            // Map fields to match Angular interface
            if (isset($sanitizedBanner['message'])) {
                $sanitizedBanner['text'] = $sanitizedBanner['message'];
                unset($sanitizedBanner['message']);
            }

            // Log activity
            $this->logActivity('banner_updated', [
                'banner_id' => $updatedBanner['id'],
                'changes' => array_intersect_key($validatedData, array_flip(['message', 'is_visible', 'background_color', 'text_color']))
            ]);

            ResponseHelper::success($sanitizedBanner, 'Banner updated successfully');

        } catch (Exception $e) {
            error_log("HeroBanner::update - " . $e->getMessage());
            ResponseHelper::serverError('Failed to update banner: ' . $e->getMessage());
        }
    }

    /**
     * Toggle banner visibility
     * PATCH /api/v1/hero-banner/toggle
     */
    public function toggle() {
        try {
            // Check permissions
            $user = $this->getCurrentUser();
            if (!$user) {
                ResponseHelper::unauthorized('Authentication required');
                return;
            }

            if (!$this->heroBannerModel->canEdit($user['user_id'], $user['role'])) {
                ResponseHelper::forbidden('Insufficient permissions to toggle banner');
                return;
            }

            // Toggle visibility
            $updatedBanner = $this->heroBannerModel->toggleVisibility();
            $sanitizedBanner = $this->heroBannerModel->sanitizeOutput($updatedBanner);

            // Map fields to match Angular interface
            if (isset($sanitizedBanner['message'])) {
                $sanitizedBanner['text'] = $sanitizedBanner['message'];
                unset($sanitizedBanner['message']);
            }

            // Log activity
            $this->logActivity('banner_toggled', [
                'banner_id' => $updatedBanner['id'],
                'new_visibility' => $updatedBanner['is_visible']
            ]);

            ResponseHelper::success($sanitizedBanner, 'Banner visibility toggled successfully');

        } catch (Exception $e) {
            error_log("HeroBanner::toggle - " . $e->getMessage());
            ResponseHelper::serverError('Failed to toggle banner visibility: ' . $e->getMessage());
        }
    }

    /**
     * Get banner statistics
     * GET /api/v1/hero-banner/stats
     */
    public function stats() {
        try {
            // Check permissions
            if (!$this->hasRole('admin')) {
                ResponseHelper::forbidden('Admin access required');
                return;
            }

            $stats = $this->heroBannerModel->getStats();

            ResponseHelper::success([
                'stats' => $stats
            ], 'Banner statistics retrieved successfully');

        } catch (Exception $e) {
            error_log("HeroBanner::stats - " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve banner statistics: ' . $e->getMessage());
        }
    }

    /**
     * Reset banner to default configuration
     * POST /api/v1/hero-banner/reset
     */
    public function reset() {
        try {
            // Check permissions
            $user = $this->getCurrentUser();
            if (!$user) {
                ResponseHelper::unauthorized('Authentication required');
                return;
            }

            if (!$this->hasRole('admin')) {
                ResponseHelper::forbidden('Admin access required to reset banner');
                return;
            }

            // Reset to default values
            $defaultData = [
                'message' => 'Enrolling for 2025!',
                'is_visible' => true,
                'background_color' => '#fc7900',
                'text_color' => '#ffffff'
            ];

            $updatedBanner = $this->heroBannerModel->update($defaultData, $user['user_id']);
            $sanitizedBanner = $this->heroBannerModel->sanitizeOutput($updatedBanner);

            // Map fields to match Angular interface
            if (isset($sanitizedBanner['message'])) {
                $sanitizedBanner['text'] = $sanitizedBanner['message'];
                unset($sanitizedBanner['message']);
            }

            // Log activity
            $this->logActivity('banner_reset', [
                'banner_id' => $updatedBanner['id']
            ]);

            ResponseHelper::success($sanitizedBanner, 'Banner reset to default configuration successfully');

        } catch (Exception $e) {
            error_log("HeroBanner::reset - " . $e->getMessage());
            ResponseHelper::serverError('Failed to reset banner: ' . $e->getMessage());
        }
    }
}