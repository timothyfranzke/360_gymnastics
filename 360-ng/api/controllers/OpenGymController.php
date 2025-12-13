<?php
/**
 * OpenGym Controller
 * Handles CRUD operations for open gym configurations and age groups
 */

require_once 'BaseController.php';

class OpenGymController extends BaseController {
    private $openGym;

    public function __construct($database) {
        parent::__construct($database);
        $this->openGym = new OpenGym($database);
    }

    /**
     * Get all open gym data (main config, structured config, and age groups)
     */
    public function getAll() {
        try {
            $mainConfig = $this->openGym->getMainConfig();
            $structuredConfig = $this->openGym->getStructuredConfig();
            $ageGroups = $this->openGym->getAgeGroups();

            $data = [
                'mainConfig' => $mainConfig,
                'structuredConfig' => $structuredConfig,
                'ageGroups' => $ageGroups
            ];

            ResponseHelper::success($data);

        } catch (Exception $e) {
            ResponseHelper::error('Failed to retrieve open gym data', 500);
        }
    }

    /**
     * Get main configuration only
     */
    public function getMainConfig() {
        try {
            $config = $this->openGym->getMainConfig();
            ResponseHelper::success($config);

        } catch (Exception $e) {
            ResponseHelper::error('Failed to retrieve main configuration', 500);
        }
    }

    /**
     * Get structured configuration only
     */
    public function getStructuredConfig() {
        try {
            $config = $this->openGym->getStructuredConfig();
            ResponseHelper::success($config);

        } catch (Exception $e) {
            ResponseHelper::error('Failed to retrieve structured configuration', 500);
        }
    }

    /**
     * Update main configuration
     */
    public function updateMainConfig() {
        $this->requireRole('admin');

        $rules = [
            'title' => ['maxLength' => 200],
            'subtitle' => ['maxLength' => 500],
            'description' => [],
            'schedule' => [],
            'features' => [],
            'importantInfo' => []
        ];

        $data = $this->validate($rules);
        if (!$data) return;

        try {
            $result = $this->openGym->updateMainConfig($data);

            if ($result) {
                $this->logActivity('update_main_config', $data);
                ResponseHelper::success(['message' => 'Main configuration updated successfully']);
            } else {
                ResponseHelper::error('Failed to update main configuration', 400);
            }

        } catch (Exception $e) {
            ResponseHelper::error('Failed to update main configuration', 500);
        }
    }

    /**
     * Update structured configuration
     */
    public function updateStructuredConfig() {
        $this->requireRole('admin');

        $rules = [
            'title' => ['maxLength' => 200],
            'subtitle' => ['maxLength' => 500],
            'description' => [],
            'schedule' => [],
            'features' => [],
            'importantInfo' => []
        ];

        $data = $this->validate($rules);
        if (!$data) return;

        try {
            $result = $this->openGym->updateStructuredConfig($data);

            if ($result) {
                $this->logActivity('update_structured_config', $data);
                ResponseHelper::success(['message' => 'Structured configuration updated successfully']);
            } else {
                ResponseHelper::error('Failed to update structured configuration', 400);
            }

        } catch (Exception $e) {
            ResponseHelper::error('Failed to update structured configuration', 500);
        }
    }

    /**
     * Get all age groups
     */
    public function getAgeGroups() {
        try {
            $ageGroups = $this->openGym->getAgeGroups();
            ResponseHelper::success($ageGroups);

        } catch (Exception $e) {
            ResponseHelper::error('Failed to retrieve age groups', 500);
        }
    }

    /**
     * Get single age group by ID
     */
    public function getAgeGroup($id) {
        if (!$id || !is_numeric($id)) {
            ResponseHelper::error('Invalid age group ID', 400);
            return;
        }

        try {
            $ageGroup = $this->openGym->getAgeGroupById($id);

            if (!$ageGroup) {
                ResponseHelper::error('Age group not found', 404);
                return;
            }

            ResponseHelper::success($ageGroup);

        } catch (Exception $e) {
            ResponseHelper::error('Failed to retrieve age group', 500);
        }
    }

    /**
     * Create new age group
     */
    public function createAgeGroup() {
        $this->requireRole('admin');

        $rules = [
            'title' => ['required', 'maxLength' => 100],
            'subtitle' => ['maxLength' => 200],
            'days' => ['maxLength' => 100],
            'time' => ['maxLength' => 100],
            'price' => ['numeric', 'min' => 0],
            'priceUnit' => ['maxLength' => 50],
            'notes' => [],
            'sortOrder' => ['numeric', 'min' => 0],
            'colorTheme' => ['maxLength' => 50]
        ];

        $data = $this->validate($rules);
        if (!$data) return;

        try {
            $id = $this->openGym->createAgeGroup($data);

            if ($id) {
                $this->logActivity('create_age_group', $data);
                ResponseHelper::success(['id' => $id, 'message' => 'Age group created successfully']);
            } else {
                ResponseHelper::error('Failed to create age group', 400);
            }

        } catch (Exception $e) {
            ResponseHelper::error('Failed to create age group', 500);
        }
    }

    /**
     * Update age group
     */
    public function updateAgeGroup($id) {
        $this->requireRole('admin');

        if (!$id || !is_numeric($id)) {
            ResponseHelper::error('Invalid age group ID', 400);
            return;
        }

        // Check if age group exists
        $existing = $this->openGym->getAgeGroupById($id);
        if (!$existing) {
            ResponseHelper::error('Age group not found', 404);
            return;
        }

        $rules = [
            'title' => ['maxLength' => 100],
            'subtitle' => ['maxLength' => 200],
            'days' => ['maxLength' => 100],
            'time' => ['maxLength' => 100],
            'price' => ['numeric', 'min' => 0],
            'priceUnit' => ['maxLength' => 50],
            'notes' => [],
            'sortOrder' => ['numeric', 'min' => 0],
            'colorTheme' => ['maxLength' => 50]
        ];

        $data = $this->validate($rules);
        if (!$data) return;

        try {
            $result = $this->openGym->updateAgeGroup($id, $data);

            if ($result) {
                $this->logActivity('update_age_group', ['id' => $id, 'data' => $data]);
                ResponseHelper::success(['message' => 'Age group updated successfully']);
            } else {
                ResponseHelper::error('Failed to update age group', 400);
            }

        } catch (Exception $e) {
            ResponseHelper::error('Failed to update age group', 500);
        }
    }

    /**
     * Delete age group
     */
    public function deleteAgeGroup($id) {
        $this->requireRole('admin');

        if (!$id || !is_numeric($id)) {
            ResponseHelper::error('Invalid age group ID', 400);
            return;
        }

        // Check if age group exists
        $existing = $this->openGym->getAgeGroupById($id);
        if (!$existing) {
            ResponseHelper::error('Age group not found', 404);
            return;
        }

        try {
            $result = $this->openGym->deleteAgeGroup($id);

            if ($result) {
                $this->logActivity('delete_age_group', ['id' => $id]);
                ResponseHelper::success(['message' => 'Age group deleted successfully']);
            } else {
                ResponseHelper::error('Failed to delete age group', 400);
            }

        } catch (Exception $e) {
            ResponseHelper::error('Failed to delete age group', 500);
        }
    }
}