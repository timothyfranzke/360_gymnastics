<?php
/**
 * PartyPageSettings Controller
 * Handles party page settings CRUD operations
 */

class PartyPageSettingsController extends BaseController {
    private $settingsModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->settingsModel = new PartyPageSettings($database);
    }

    /**
     * Get current settings (admin)
     * GET /api/v1/party-page-settings
     */
    public function index() {
        try {
            $settings = $this->settingsModel->getCurrent();
            $sanitized = $this->settingsModel->sanitizeOutput($settings);

            ResponseHelper::success($sanitized, 'Party page settings retrieved successfully');

        } catch (Exception $e) {
            error_log("PartyPageSettings::index - " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve party page settings: ' . $e->getMessage());
        }
    }

    /**
     * Get settings for public display (no auth required)
     * GET /api/v1/party-page-settings/public
     */
    public function publicSettings() {
        try {
            $settings = $this->settingsModel->getCurrent();
            $sanitized = $this->settingsModel->sanitizeOutput($settings);
            $publicSettings = $this->settingsModel->getPublicView($sanitized);

            ResponseHelper::success($publicSettings, 'Public party page settings retrieved successfully');

        } catch (Exception $e) {
            error_log("PartyPageSettings::publicSettings - " . $e->getMessage());
            ResponseHelper::success([
                'intro' => '360 Gymnastics is a great place to have your next birthday party, school field trip, scouting event, or any other special event!',
                'footer_note' => '',
                'packages' => []
            ], 'Default party page settings retrieved');
        }
    }

    /**
     * Update settings
     * PUT /api/v1/party-page-settings
     */
    public function update() {
        try {
            $user = $this->getCurrentUser();
            if (!$user) {
                ResponseHelper::unauthorized('Authentication required');
                return;
            }

            if (!$this->settingsModel->canEdit($user['user_id'], $user['role'])) {
                ResponseHelper::forbidden('Insufficient permissions to edit party page settings');
                return;
            }

            $data = $this->getInput();

            $validationErrors = $this->settingsModel->validateData($data);
            if (!empty($validationErrors)) {
                ResponseHelper::validationError($validationErrors);
                return;
            }

            $updatedSettings = $this->settingsModel->update($data);
            $sanitized = $this->settingsModel->sanitizeOutput($updatedSettings);

            $this->logActivity('party_page_settings_updated', [
                'changes' => array_keys($data)
            ]);

            ResponseHelper::success($sanitized, 'Party page settings updated successfully');

        } catch (Exception $e) {
            error_log("PartyPageSettings::update - " . $e->getMessage());
            ResponseHelper::serverError('Failed to update party page settings: ' . $e->getMessage());
        }
    }
}
