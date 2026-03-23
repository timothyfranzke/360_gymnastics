<?php
/**
 * Announcement Controller
 * Handles announcement CRUD operations
 */

class AnnouncementController extends BaseController {
    private $announcementModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->announcementModel = new Announcement($database);
    }

    /**
     * Get all announcements
     * GET /api/v1/announcements
     */
    public function index() {
        try {
            $pagination = $this->getPaginationParams();
            $search = $this->getSearchParams();
            
            $filters = [
                'search' => $search['search'],
                'type' => $_GET['type'] ?? null,
                'priority' => $_GET['priority'] ?? null,
                'is_active' => isset($_GET['is_active']) ? filter_var($_GET['is_active'], FILTER_VALIDATE_BOOLEAN) : null,
                'date_from' => $_GET['date_from'] ?? null,
                'date_to' => $_GET['date_to'] ?? null,
                'current_only' => isset($_GET['current_only']) ? filter_var($_GET['current_only'], FILTER_VALIDATE_BOOLEAN) : false,
                'sort_by' => $search['sort_by'],
                'sort_order' => $search['sort_order']
            ];

            $result = $this->announcementModel->getAll($pagination, $filters);

            ResponseHelper::paginated(
                $result['announcements'],
                $result['total'],
                $pagination['page'],
                $pagination['page_size'],
                'Announcements retrieved successfully'
            );

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve announcements: ' . $e->getMessage());
        }
    }

    /**
     * Get active announcements for public display
     * GET /api/v1/announcements/active
     */
    public function active() {
        try {
            $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : null;
            $announcements = $this->announcementModel->getActiveAnnouncements($limit);

            ResponseHelper::success([
                'announcements' => $announcements
            ], 'Active announcements retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve active announcements: ' . $e->getMessage());
        }
    }

    /**
     * Get announcements by type
     * GET /api/v1/announcements/type/{type}
     */
    public function byType($type) {
        $allowedTypes = ['general', 'class', 'maintenance', 'event', 'closure'];
        
        if (!in_array($type, $allowedTypes)) {
            ResponseHelper::error('Invalid announcement type', 400);
            return;
        }

        try {
            $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : null;
            $announcements = $this->announcementModel->getByType($type, $limit);

            ResponseHelper::success([
                'announcements' => $announcements,
                'type' => $type
            ], "Announcements of type '$type' retrieved successfully");

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve announcements: ' . $e->getMessage());
        }
    }

    /**
     * Get single announcement
     * GET /api/v1/announcements/{id}
     */
    public function show($id) {
        try {
            $announcement = $this->announcementModel->findById($id);

            if (!$announcement) {
                ResponseHelper::notFound('Announcement not found');
                return;
            }

            ResponseHelper::success([
                'announcement' => $announcement
            ], 'Announcement retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve announcement: ' . $e->getMessage());
        }
    }

    /**
     * Create new announcement
     * POST /api/v1/announcements
     */
    public function create() {
        // Require staff role or higher
        if (!$this->requireRole('staff')) return;

        $data = $this->validate([
            'title' => ['required', 'maxLength' => [200]],
            'content' => ['required'],
            'type' => ['in' => [['general', 'class', 'maintenance', 'event', 'closure']]],
            'priority' => ['in' => [['low', 'medium', 'high', 'critical']]],
            'start_date' => ['required', 'date'],
            'end_date' => ['date']
        ]);

        if (!$data) return;

        // Validate end_date is after start_date
        if (!empty($data['end_date']) && $data['end_date'] < $data['start_date']) {
            ResponseHelper::validationError(['end_date' => ['End date must be after start date']]);
            return;
        }

        try {
            $currentUser = $this->getCurrentUser();
            $data['created_by'] = $currentUser['user_id'];

            $announcement = $this->announcementModel->create($data);

            $this->logActivity('announcement_created', [
                'announcement_id' => $announcement['id'],
                'title' => $announcement['title'],
                'type' => $announcement['type']
            ]);

            ResponseHelper::created([
                'announcement' => $announcement
            ], 'Announcement created successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to create announcement: ' . $e->getMessage());
        }
    }

    /**
     * Update announcement
     * PUT /api/v1/announcements/{id}
     */
    public function update($id) {
        try {
            $announcement = $this->announcementModel->findById($id);

            if (!$announcement) {
                ResponseHelper::notFound('Announcement not found');
                return;
            }

            $currentUser = $this->getCurrentUser();
            
            // Check permissions
            if (!$this->announcementModel->canEdit($id, $currentUser['user_id'], $currentUser['role'])) {
                ResponseHelper::forbidden('You do not have permission to edit this announcement');
                return;
            }

            $data = $this->validate([
                'title' => ['maxLength' => [200]],
                'content' => [],
                'type' => ['in' => [['general', 'class', 'maintenance', 'event', 'closure']]],
                'priority' => ['in' => [['low', 'medium', 'high', 'critical']]],
                'start_date' => ['date'],
                'end_date' => ['date'],
                'is_active' => ['boolean']
            ]);

            if (!$data) return;

            // Validate end_date is after start_date
            $startDate = $data['start_date'] ?? $announcement['start_date'];
            if (!empty($data['end_date']) && $data['end_date'] < $startDate) {
                ResponseHelper::validationError(['end_date' => ['End date must be after start date']]);
                return;
            }

            $updatedAnnouncement = $this->announcementModel->update($id, $data);

            $this->logActivity('announcement_updated', [
                'announcement_id' => $id,
                'title' => $updatedAnnouncement['title'],
                'updated_fields' => array_keys($data)
            ]);

            ResponseHelper::updated([
                'announcement' => $updatedAnnouncement
            ], 'Announcement updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to update announcement: ' . $e->getMessage());
        }
    }

    /**
     * Delete announcement
     * DELETE /api/v1/announcements/{id}
     */
    public function delete($id) {
        try {
            $announcement = $this->announcementModel->findById($id);

            if (!$announcement) {
                ResponseHelper::notFound('Announcement not found');
                return;
            }

            $currentUser = $this->getCurrentUser();
            
            // Check permissions
            if (!$this->announcementModel->canEdit($id, $currentUser['user_id'], $currentUser['role'])) {
                ResponseHelper::forbidden('You do not have permission to delete this announcement');
                return;
            }

            $this->announcementModel->delete($id);

            $this->logActivity('announcement_deleted', [
                'announcement_id' => $id,
                'title' => $announcement['title'],
                'type' => $announcement['type']
            ]);

            ResponseHelper::deleted('Announcement deleted successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to delete announcement: ' . $e->getMessage());
        }
    }

    /**
     * Toggle announcement active status
     * PATCH /api/v1/announcements/{id}/toggle
     */
    public function toggle($id) {
        try {
            $announcement = $this->announcementModel->findById($id);

            if (!$announcement) {
                ResponseHelper::notFound('Announcement not found');
                return;
            }

            $currentUser = $this->getCurrentUser();
            
            // Check permissions
            if (!$this->announcementModel->canEdit($id, $currentUser['user_id'], $currentUser['role'])) {
                ResponseHelper::forbidden('You do not have permission to modify this announcement');
                return;
            }

            $updatedAnnouncement = $this->announcementModel->toggleActive($id);

            $this->logActivity('announcement_toggled', [
                'announcement_id' => $id,
                'title' => $announcement['title'],
                'new_status' => $updatedAnnouncement['is_active'] ? 'active' : 'inactive'
            ]);

            ResponseHelper::updated([
                'announcement' => $updatedAnnouncement
            ], 'Announcement status updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to toggle announcement status: ' . $e->getMessage());
        }
    }

    /**
     * Get announcement statistics
     * GET /api/v1/announcements/stats
     */
    public function stats() {
        // Require staff role or higher
        if (!$this->requireRole('staff')) return;

        try {
            $stats = $this->announcementModel->getStats();

            ResponseHelper::success([
                'stats' => $stats
            ], 'Announcement statistics retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve announcement statistics: ' . $e->getMessage());
        }
    }
}