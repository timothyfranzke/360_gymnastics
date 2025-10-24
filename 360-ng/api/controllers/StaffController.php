<?php
/**
 * Staff Controller
 * Handles staff member CRUD operations
 */

class StaffController extends BaseController {
    private $staffModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->staffModel = new Staff($database);
    }

    /**
     * Get all staff members
     * GET /api/v1/staff
     */
    public function index() {
        try {
            $pagination = $this->getPaginationParams();
            $search = $this->getSearchParams();
            
            $filters = [
                'search' => $search['search'],
                'hire_date_from' => $_GET['hire_date_from'] ?? null,
                'hire_date_to' => $_GET['hire_date_to'] ?? null,
                'sort_by' => $search['sort_by'],
                'sort_order' => $search['sort_order']
            ];

            $result = $this->staffModel->getAll($pagination, $filters);

            ResponseHelper::paginated(
                $result['staff'],
                $result['total'],
                $pagination['page'],
                $pagination['page_size'],
                'Staff members retrieved successfully'
            );

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve staff members: ' . $e->getMessage());
        }
    }

    /**
     * Get single staff member
     * GET /api/v1/staff/{id}
     */
    public function show($id) {
        try {
            $staff = $this->staffModel->findById($id);

            if (!$staff) {
                ResponseHelper::notFound('Staff member not found');
                return;
            }

            ResponseHelper::success([
                'staff' => $staff
            ], 'Staff member retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve staff member: ' . $e->getMessage());
        }
    }

    /**
     * Create new staff member
     * POST /api/v1/staff
     */
    public function create() {
        $data = $this->validate([
            'first_name' => ['required', 'maxLength' => [50]],
            'last_name' => ['required', 'maxLength' => [50]],
            'hire_date' => ['required', 'date'],
            'image' => ['maxLength' => [500]],
            'description' => ['maxLength' => [65535]]
        ]);

        if (!$data) return;

        // Validate hire date is not in the future
        if ($data['hire_date'] > date('Y-m-d')) {
            ResponseHelper::validationError(['hire_date' => ['Hire date cannot be in the future']]);
            return;
        }


        try {
            $staffData = [
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'hire_date' => $data['hire_date'],
                'image' => $data['image'] ?? null,
                'description' => $data['description'] ?? null
            ];

            $staff = $this->staffModel->create($staffData);

            ResponseHelper::created([
                'staff' => $staff
            ], 'Staff member created successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to create staff member: ' . $e->getMessage());
        }
    }

    /**
     * Update staff member
     * PUT /api/v1/staff/{id}
     */
    public function update($id) {
        try {
            $staff = $this->staffModel->findById($id);

            if (!$staff) {
                ResponseHelper::notFound('Staff member not found');
                return;
            }

            $data = $this->validate([
                'first_name' => ['maxLength' => [50]],
                'last_name' => ['maxLength' => [50]],
                'hire_date' => ['date'],
                'image' => ['maxLength' => [500]],
                'description' => ['maxLength' => [65535]]
            ]);
            
            if (!$data) return;

            // Validate hire date is not in the future
            if (isset($data['hire_date']) && $data['hire_date'] > date('Y-m-d')) {
                ResponseHelper::validationError(['hire_date' => ['Hire date cannot be in the future']]);
                return;
            }


            $updatedStaff = $this->staffModel->update($id, $data);

            ResponseHelper::updated([
                'staff' => $updatedStaff
            ], 'Staff member updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to update staff member: ' . $e->getMessage());
        }
    }

    /**
     * Delete staff member
     * DELETE /api/v1/staff/{id}
     */
    public function delete($id) {
        try {
            $staff = $this->staffModel->findById($id);

            if (!$staff) {
                ResponseHelper::notFound('Staff member not found');
                return;
            }

            $this->staffModel->delete($id);

            ResponseHelper::deleted('Staff member deleted successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to delete staff member: ' . $e->getMessage());
        }
    }

    /**
     * Get staff statistics
     * GET /api/v1/staff/stats
     */
    public function stats() {
        try {
            $stats = $this->staffModel->getStats();

            ResponseHelper::success([
                'stats' => $stats
            ], 'Staff statistics retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve staff statistics: ' . $e->getMessage());
        }
    }




    /**
     * Get staff members for homepage display
     * GET /api/v1/staff/homepage
     * Public endpoint - no authentication required
     */
    public function homepage() {
        try {
            $staff = $this->staffModel->getHomepageStaff();

            ResponseHelper::success([
                'staff' => $staff,
                'total' => count($staff)
            ], 'Homepage staff retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve homepage staff: ' . $e->getMessage());
        }
    }

    /**
     * Upload staff photo anonymously (for use during staff creation)
     * POST /api/v1/staff/upload-photo-anonymous
     */
    public function uploadPhotoAnonymous() {
        try {
            // Check if file was uploaded
            if (!isset($_FILES['photo']) || $_FILES['photo']['error'] === UPLOAD_ERR_NO_FILE) {
                ResponseHelper::validationError(['photo' => ['Photo file is required']]);
                return;
            }

            // Upload and process the file
            $result = FileUploadUtility::uploadAnonymousStaffPhoto($_FILES['photo']);

            if (!$result['success']) {
                ResponseHelper::validationError(['photo' => $result['errors']]);
                return;
            }

            ResponseHelper::created([
                'filename' => $result['filename'],
                'original_url' => $result['url'],
                'thumbnail_url' => $result['thumbnail_url'],
                'size' => $result['size'],
                'dimensions' => $result['dimensions'],
                'path' => $result['path']
            ], 'Photo uploaded successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to upload photo: ' . $e->getMessage());
        }
    }

    /**
     * Upload staff photo
     * POST /api/v1/staff/upload-photo
     */
    public function uploadPhoto() {
        try {
            $staffId = $_POST['staff_id'] ?? null;

            // Validate staff ID
            if (empty($staffId)) {
                ResponseHelper::validationError(['staff_id' => ['Staff ID is required']]);
                return;
            }

            // Validate that staff member exists
            $staff = $this->staffModel->findById($staffId);
            if (!$staff) {
                ResponseHelper::notFound('Staff member not found');
                return;
            }

            // Check if file was uploaded
            if (!isset($_FILES['photo']) || $_FILES['photo']['error'] === UPLOAD_ERR_NO_FILE) {
                ResponseHelper::validationError(['photo' => ['Photo file is required']]);
                return;
            }

            // Upload and process the file
            $result = FileUploadUtility::uploadStaffPhoto($_FILES['photo'], $staffId);

            if (!$result['success']) {
                ResponseHelper::validationError(['photo' => $result['errors']]);
                return;
            }

            // Clean up old photos for this staff member
            $oldImagePath = $staff['image'] ?? null;
            if ($oldImagePath) {
                FileUploadUtility::cleanupOldFiles($oldImagePath);
            }

            // Update staff record with new photo path
            $staffData = [
                'image' => $result['path']
            ];

            $updatedStaff = $this->staffModel->update($staffId, $staffData);

            ResponseHelper::created([
                'staff' => $updatedStaff,
                'file_info' => [
                    'filename' => $result['filename'],
                    'url' => $result['url'],
                    'thumbnail_url' => $result['thumbnail_url'],
                    'size' => $result['size'],
                    'dimensions' => $result['dimensions']
                ]
            ], 'Staff photo uploaded successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to upload staff photo: ' . $e->getMessage());
        }
    }

    /**
     * Delete staff photo
     * DELETE /api/v1/staff/{id}/photo
     */
    public function deletePhoto($id) {
        try {
            $staff = $this->staffModel->findById($id);

            if (!$staff) {
                ResponseHelper::notFound('Staff member not found');
                return;
            }

            // Delete the file if it exists
            if (!empty($staff['image'])) {
                $filename = basename($staff['image']);
                FileUploadUtility::deleteStaffPhoto($filename);
            }

            // Update staff record to remove photo reference
            $staffData = [
                'image' => null
            ];

            $updatedStaff = $this->staffModel->update($id, $staffData);

            ResponseHelper::success([
                'staff' => $updatedStaff
            ], 'Staff photo deleted successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to delete staff photo: ' . $e->getMessage());
        }
    }

    /**
     * Get staff photo info
     * GET /api/v1/staff/{id}/photo
     */
    public function getPhotoInfo($id) {
        try {
            $staff = $this->staffModel->findById($id);

            if (!$staff) {
                ResponseHelper::notFound('Staff member not found');
                return;
            }

            if (empty($staff['image'])) {
                ResponseHelper::success([
                    'has_photo' => false,
                    'photo_info' => null
                ], 'No photo found for this staff member');
                return;
            }

            $filename = basename($staff['image']);
            $fileInfo = FileUploadUtility::getFileInfo($filename);

            if (!$fileInfo) {
                ResponseHelper::success([
                    'has_photo' => false,
                    'photo_info' => null
                ], 'Photo file not found');
                return;
            }

            ResponseHelper::success([
                'has_photo' => true,
                'photo_info' => $fileInfo
            ], 'Staff photo info retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve staff photo info: ' . $e->getMessage());
        }
    }
}