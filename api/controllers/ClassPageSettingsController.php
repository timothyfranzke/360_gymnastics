<?php
/**
 * ClassPageSettings Controller
 * Handles class page settings CRUD operations
 */

class ClassPageSettingsController extends BaseController {
    private $settingsModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->settingsModel = new ClassPageSettings($database);
    }

    /**
     * Get current settings
     * GET /api/v1/class-page-settings
     */
    public function index() {
        try {
            $settings = $this->settingsModel->getCurrent();
            $sanitized = $this->settingsModel->sanitizeOutput($settings);

            ResponseHelper::success($sanitized, 'Class page settings retrieved successfully');

        } catch (Exception $e) {
            error_log("ClassPageSettings::index - " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve class page settings: ' . $e->getMessage());
        }
    }

    /**
     * Get settings for public display (no auth required)
     * GET /api/v1/class-page-settings/public
     */
    public function publicSettings() {
        try {
            $settings = $this->settingsModel->getCurrent();
            $sanitized = $this->settingsModel->sanitizeOutput($settings);

            // Only return essential fields for public consumption
            $publicSettings = [
                'description' => $sanitized['description'] ?? '',
                'pricing_tiers' => $sanitized['pricing_tiers'] ?? [],
                'registration_fee' => $sanitized['registration_fee'] ?? ''
            ];

            ResponseHelper::success($publicSettings, 'Public class page settings retrieved successfully');

        } catch (Exception $e) {
            error_log("ClassPageSettings::publicSettings - " . $e->getMessage());
            // Return default values on error
            ResponseHelper::success([
                'description' => 'We offer a variety of classes for all ages and skill levels. Our experienced instructors provide a fun, no-pressure atmosphere while teaching the fundamentals of gymnastics, social skills, and life skills.',
                'pricing_tiers' => [
                    ['duration' => '50 minute class', 'price' => '$69/month'],
                    ['duration' => '55 minute class', 'price' => '$74/month'],
                    ['duration' => '60 minute class', 'price' => '$82/month'],
                    ['duration' => '90 minute class', 'price' => '$97/month']
                ],
                'registration_fee' => '$15 annual registration fee per person ($30 max per family)'
            ], 'Default class page settings retrieved');
        }
    }

    /**
     * Update settings
     * PUT /api/v1/class-page-settings
     */
    public function update() {
        try {
            // Check permissions
            $user = $this->getCurrentUser();
            if (!$user) {
                ResponseHelper::unauthorized('Authentication required');
                return;
            }

            if (!$this->settingsModel->canEdit($user['user_id'], $user['role'])) {
                ResponseHelper::forbidden('Insufficient permissions to edit class page settings');
                return;
            }

            // Get and validate input
            $data = $this->getInput();

            // Validate data
            $validationErrors = $this->settingsModel->validateData($data);
            if (!empty($validationErrors)) {
                ResponseHelper::validationError($validationErrors);
                return;
            }

            // Update settings
            $updatedSettings = $this->settingsModel->update($data);
            $sanitized = $this->settingsModel->sanitizeOutput($updatedSettings);

            // Log activity
            $this->logActivity('class_page_settings_updated', [
                'changes' => array_keys($data)
            ]);

            ResponseHelper::success($sanitized, 'Class page settings updated successfully');

        } catch (Exception $e) {
            error_log("ClassPageSettings::update - " . $e->getMessage());
            ResponseHelper::serverError('Failed to update class page settings: ' . $e->getMessage());
        }
    }
}
