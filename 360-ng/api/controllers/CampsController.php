<?php
/**
 * Camps Controller
 * Handles HTTP requests for camp management
 */

class CampsController extends BaseController {
    private $campModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->campModel = new Camp($database);
    }

    /**
     * GET /camps - Get all camps with pagination and filters
     */
    public function index() {
        try {
            $pagination = $this->getPaginationParams();
            $searchParams = $this->getSearchParams();
            
            // Get filters from request
            $filters = [
                'search' => $searchParams['search'],
                'sort_by' => $searchParams['sort_by'],
                'sort_order' => $searchParams['sort_order'],
                'is_active' => isset($_GET['is_active']) ? (bool) $_GET['is_active'] : null,
                'date_from' => $_GET['date_from'] ?? null,
                'date_to' => $_GET['date_to'] ?? null
            ];

            // Remove null values from filters
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            // Get total count and paginated data
            $total = $this->campModel->getCount($filters);
            $camps = $this->campModel->getAll($filters, $pagination);

            ResponseHelper::paginated(
                $camps,
                $total,
                $pagination['page'],
                $pagination['page_size'],
                'Camps retrieved successfully'
            );

        } catch (Exception $e) {
            error_log("Error in CampsController::index: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve camps');
        }
    }

    /**
     * GET /camps/active - Get active camps (public endpoint)
     */
    public function active() {
        try {
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;
            $camps = $this->campModel->getActive($limit);

            ResponseHelper::success($camps, 'Active camps retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in CampsController::active: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve active camps');
        }
    }

    /**
     * GET /camps/upcoming - Get upcoming camps (public endpoint)
     */
    public function upcoming() {
        try {
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;
            $camps = $this->campModel->getUpcoming($limit);

            ResponseHelper::success($camps, 'Upcoming camps retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in CampsController::upcoming: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve upcoming camps');
        }
    }

    /**
     * GET /camps/{id} - Get specific camp
     */
    public function show($id) {
        try {
            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid camp ID', 400);
                return;
            }

            $camp = $this->campModel->getById($id);

            if (!$camp) {
                ResponseHelper::notFound('Camp not found');
                return;
            }

            ResponseHelper::success($camp, 'Camp retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in CampsController::show: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve camp');
        }
    }

    /**
     * POST /camps - Create new camp
     */
    public function create() {
        try {
            // Require admin role for creating camps
            if (!$this->requireRole('admin')) {
                return;
            }

            $validationRules = [
                'title' => ['required', 'minLength' => 3, 'maxLength' => 255],
                'date' => ['required', 'date'],
                'cost' => ['required', 'numeric', 'min' => 0],
                'description' => ['required', 'minLength' => 10],
                'time' => ['required', 'minLength' => 5],
                'registration_link' => ['required', 'url']
            ];

            $data = $this->validate($validationRules);
            if (!$data) return;

            // Validate date is not in the past
            $campDate = new DateTime($data['date']);
            $today = new DateTime();
            if ($campDate < $today) {
                ResponseHelper::error('Camp date cannot be in the past', 400);
                return;
            }

            $camp = $this->campModel->create($data);

            $this->logActivity('create_camp', ['camp_id' => $camp['id'], 'title' => $camp['title']]);
            ResponseHelper::created($camp, 'Camp created successfully');

        } catch (Exception $e) {
            error_log("Error in CampsController::create: " . $e->getMessage());
            ResponseHelper::serverError('Failed to create camp');
        }
    }

    /**
     * PUT /camps/{id} - Update camp
     */
    public function update($id) {
        try {
            // Require admin role for updating camps
            if (!$this->requireRole('admin')) {
                return;
            }

            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid camp ID', 400);
                return;
            }

            if (!$this->campModel->exists($id)) {
                ResponseHelper::notFound('Camp not found');
                return;
            }

            $validationRules = [
                'title' => ['minLength' => 3, 'maxLength' => 255],
                'date' => ['date'],
                'cost' => ['numeric', 'min' => 0],
                'description' => ['minLength' => 10],
                'time' => ['minLength' => 5],
                'registration_link' => ['url'],
                'is_active' => ['boolean']
            ];

            $data = $this->validate($validationRules);
            if (!$data) return;

            // Validate date is not in the past if provided
            if (isset($data['date'])) {
                $campDate = new DateTime($data['date']);
                $today = new DateTime();
                if ($campDate < $today) {
                    ResponseHelper::error('Camp date cannot be in the past', 400);
                    return;
                }
            }

            $camp = $this->campModel->update($id, $data);

            $this->logActivity('update_camp', ['camp_id' => $id, 'updates' => array_keys($data)]);
            ResponseHelper::updated($camp, 'Camp updated successfully');

        } catch (Exception $e) {
            error_log("Error in CampsController::update: " . $e->getMessage());
            ResponseHelper::serverError('Failed to update camp');
        }
    }

    /**
     * DELETE /camps/{id} - Delete camp
     */
    public function delete($id) {
        try {
            // Require admin role for deleting camps
            if (!$this->requireRole('admin')) {
                return;
            }

            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid camp ID', 400);
                return;
            }

            if (!$this->campModel->exists($id)) {
                ResponseHelper::notFound('Camp not found');
                return;
            }

            $success = $this->campModel->delete($id);

            if ($success) {
                $this->logActivity('delete_camp', ['camp_id' => $id]);
                ResponseHelper::deleted('Camp deleted successfully');
            } else {
                ResponseHelper::serverError('Failed to delete camp');
            }

        } catch (Exception $e) {
            error_log("Error in CampsController::delete: " . $e->getMessage());
            ResponseHelper::serverError('Failed to delete camp');
        }
    }

    /**
     * GET /camps/stats - Get camp statistics
     */
    public function stats() {
        try {
            // Require admin role for viewing stats
            if (!$this->requireRole('admin')) {
                return;
            }

            $stats = $this->campModel->getStats();
            ResponseHelper::success($stats, 'Camp statistics retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in CampsController::stats: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve camp statistics');
        }
    }

    /**
     * PATCH /camps/{id}/toggle - Toggle camp active status
     */
    public function toggle($id) {
        try {
            // Require admin role for toggling camps
            if (!$this->requireRole('admin')) {
                return;
            }

            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid camp ID', 400);
                return;
            }

            $camp = $this->campModel->getById($id);
            if (!$camp) {
                ResponseHelper::notFound('Camp not found');
                return;
            }

            $newStatus = !$camp['is_active'];
            $updatedCamp = $this->campModel->update($id, ['is_active' => $newStatus]);

            $action = $newStatus ? 'activated' : 'deactivated';
            $this->logActivity('toggle_camp', ['camp_id' => $id, 'action' => $action]);
            
            ResponseHelper::updated($updatedCamp, "Camp $action successfully");

        } catch (Exception $e) {
            error_log("Error in CampsController::toggle: " . $e->getMessage());
            ResponseHelper::serverError('Failed to toggle camp status');
        }
    }
}