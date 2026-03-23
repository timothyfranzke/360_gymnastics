<?php
/**
 * Gym Closure Controller
 * Handles gym closure and holiday management
 */

class GymClosureController extends BaseController {
    private $gymClosureModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->gymClosureModel = new GymClosure($database);
    }

    /**
     * Get all gym closures
     * GET /api/v1/gym-closures
     */
    public function index() {
        try {
            $pagination = $this->getPaginationParams();
            $search = $this->getSearchParams();
            
            $filters = [
                'search' => $search['search'],
                'date_from' => $_GET['date_from'] ?? null,
                'date_to' => $_GET['date_to'] ?? null,
                'is_all_day' => isset($_GET['is_all_day']) ? filter_var($_GET['is_all_day'], FILTER_VALIDATE_BOOLEAN) : null,
                'future_only' => isset($_GET['future_only']) ? filter_var($_GET['future_only'], FILTER_VALIDATE_BOOLEAN) : false,
                'past_only' => isset($_GET['past_only']) ? filter_var($_GET['past_only'], FILTER_VALIDATE_BOOLEAN) : false,
                'sort_by' => $search['sort_by'],
                'sort_order' => $search['sort_order']
            ];

            $result = $this->gymClosureModel->getAll($pagination, $filters);

            ResponseHelper::paginated(
                $result['closures'],
                $result['total'],
                $pagination['page'],
                $pagination['page_size'],
                'Gym closures retrieved successfully'
            );

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve gym closures: ' . $e->getMessage());
        }
    }

    /**
     * Get upcoming closures
     * GET /api/v1/gym-closures/upcoming
     */
    public function upcoming() {
        try {
            $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 10;
            $closures = $this->gymClosureModel->getUpcoming($limit);

            ResponseHelper::success([
                'upcoming_closures' => $closures,
                'count' => count($closures)
            ], 'Upcoming closures retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve upcoming closures: ' . $e->getMessage());
        }
    }

    /**
     * Get current month's closures
     * GET /api/v1/gym-closures/current-month
     */
    public function currentMonth() {
        try {
            $closures = $this->gymClosureModel->getCurrentMonth();

            ResponseHelper::success([
                'month_closures' => $closures,
                'month' => date('F Y'),
                'count' => count($closures)
            ], 'Current month closures retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve current month closures: ' . $e->getMessage());
        }
    }

    /**
     * Check if gym is closed on specific date
     * GET /api/v1/gym-closures/check?date={date}&time={time}
     */
    public function checkClosure() {
        $date = $_GET['date'] ?? null;
        $time = $_GET['time'] ?? null;

        if (!$date) {
            ResponseHelper::error('Date parameter is required', 400);
            return;
        }

        // Validate date format
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            ResponseHelper::error('Invalid date format. Use YYYY-MM-DD', 400);
            return;
        }

        // Validate time format if provided
        if ($time && !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', $time)) {
            ResponseHelper::error('Invalid time format. Use HH:MM:SS', 400);
            return;
        }

        try {
            $result = $this->gymClosureModel->isClosedOnDate($date, $time);

            ResponseHelper::success([
                'date' => $date,
                'time' => $time,
                'closure_status' => $result
            ], 'Closure status checked successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to check closure status: ' . $e->getMessage());
        }
    }

    /**
     * Get single closure
     * GET /api/v1/gym-closures/{id}
     */
    public function show($id) {
        try {
            $closure = $this->gymClosureModel->findById($id);

            if (!$closure) {
                ResponseHelper::notFound('Closure not found');
                return;
            }

            ResponseHelper::success([
                'closure' => $closure
            ], 'Closure retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve closure: ' . $e->getMessage());
        }
    }

    /**
     * Create new closure
     * POST /api/v1/gym-closures
     */
    public function create() {
        // Require staff role or higher
        if (!$this->requireRole('staff')) return;

        $data = $this->validate([
            'closure_date' => ['required', 'date'],
            'reason' => ['required', 'maxLength' => [255]],
            'description' => ['maxLength' => [1000]],
            'is_all_day' => ['boolean'],
            'start_time' => ['regex' => ['/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', 'Invalid time format. Use HH:MM:SS']],
            'end_time' => ['regex' => ['/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', 'Invalid time format. Use HH:MM:SS']]
        ]);

        if (!$data) return;

        // Validate closure times
        $timeErrors = $this->gymClosureModel->validateTimes($data);
        if (!empty($timeErrors)) {
            ResponseHelper::validationError($timeErrors);
            return;
        }

        // Validate closure date is not in the past (unless admin)
        $currentUser = $this->getCurrentUser();
        if ($currentUser['role'] !== 'admin' && $data['closure_date'] < date('Y-m-d')) {
            ResponseHelper::validationError(['closure_date' => ['Cannot create closures for past dates']]);
            return;
        }

        try {
            $data['created_by'] = $currentUser['user_id'];
            $closure = $this->gymClosureModel->create($data);

            $this->logActivity('gym_closure_created', [
                'closure_id' => $closure['id'],
                'closure_date' => $closure['closure_date'],
                'reason' => $closure['reason'],
                'is_all_day' => $closure['is_all_day']
            ]);

            ResponseHelper::created([
                'closure' => $closure
            ], 'Gym closure created successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to create gym closure: ' . $e->getMessage());
        }
    }

    /**
     * Close gym for today
     * POST /api/v1/gym-closures/close-today
     */
    public function closeToday() {
        // Require staff role or higher
        if (!$this->requireRole('staff')) return;

        $data = $this->validate([
            'reason' => ['required', 'maxLength' => [255]],
            'description' => ['maxLength' => [1000]]
        ]);

        if (!$data) return;

        try {
            $currentUser = $this->getCurrentUser();
            
            $closure = $this->gymClosureModel->closeForToday(
                $data['reason'],
                $currentUser['user_id'],
                $data['description'] ?? null
            );

            $this->logActivity('gym_closed_today', [
                'closure_id' => $closure['id'],
                'reason' => $data['reason']
            ]);

            ResponseHelper::created([
                'closure' => $closure
            ], 'Gym marked as closed for today');

        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 400);
        }
    }

    /**
     * Create emergency closure
     * POST /api/v1/gym-closures/emergency
     */
    public function emergency() {
        // Require staff role or higher
        if (!$this->requireRole('staff')) return;

        $data = $this->validate([
            'reason' => ['required', 'maxLength' => [255]],
            'description' => ['maxLength' => [1000]],
            'end_date' => ['date']
        ]);

        if (!$data) return;

        try {
            $currentUser = $this->getCurrentUser();
            
            $closures = $this->gymClosureModel->createEmergencyClosure(
                $data['reason'],
                $currentUser['user_id'],
                $data['description'] ?? null,
                $data['end_date'] ?? null
            );

            $this->logActivity('emergency_closure_created', [
                'reason' => $data['reason'],
                'closures_created' => count($closures),
                'end_date' => $data['end_date'] ?? date('Y-m-d')
            ]);

            ResponseHelper::created([
                'closures' => $closures,
                'count' => count($closures)
            ], 'Emergency closure(s) created successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to create emergency closure: ' . $e->getMessage());
        }
    }

    /**
     * Update closure
     * PUT /api/v1/gym-closures/{id}
     */
    public function update($id) {
        try {
            $closure = $this->gymClosureModel->findById($id);

            if (!$closure) {
                ResponseHelper::notFound('Closure not found');
                return;
            }

            $currentUser = $this->getCurrentUser();
            
            // Check permissions
            if (!$this->gymClosureModel->canEdit($id, $currentUser['user_id'], $currentUser['role'])) {
                ResponseHelper::forbidden('You do not have permission to edit this closure');
                return;
            }

            $data = $this->validate([
                'closure_date' => ['date'],
                'reason' => ['maxLength' => [255]],
                'description' => ['maxLength' => [1000]],
                'is_all_day' => ['boolean'],
                'start_time' => ['regex' => ['/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', 'Invalid time format. Use HH:MM:SS']],
                'end_time' => ['regex' => ['/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', 'Invalid time format. Use HH:MM:SS']]
            ]);

            if (!$data) return;

            // Validate closure times
            $timeErrors = $this->gymClosureModel->validateTimes($data);
            if (!empty($timeErrors)) {
                ResponseHelper::validationError($timeErrors);
                return;
            }

            $updatedClosure = $this->gymClosureModel->update($id, $data);

            $this->logActivity('gym_closure_updated', [
                'closure_id' => $id,
                'updated_fields' => array_keys($data)
            ]);

            ResponseHelper::updated([
                'closure' => $updatedClosure
            ], 'Gym closure updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to update gym closure: ' . $e->getMessage());
        }
    }

    /**
     * Delete closure
     * DELETE /api/v1/gym-closures/{id}
     */
    public function delete($id) {
        try {
            $closure = $this->gymClosureModel->findById($id);

            if (!$closure) {
                ResponseHelper::notFound('Closure not found');
                return;
            }

            $currentUser = $this->getCurrentUser();
            
            // Check permissions
            if (!$this->gymClosureModel->canEdit($id, $currentUser['user_id'], $currentUser['role'])) {
                ResponseHelper::forbidden('You do not have permission to delete this closure');
                return;
            }

            $this->gymClosureModel->delete($id);

            $this->logActivity('gym_closure_deleted', [
                'closure_id' => $id,
                'closure_date' => $closure['closure_date'],
                'reason' => $closure['reason']
            ]);

            ResponseHelper::deleted('Gym closure deleted successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to delete gym closure: ' . $e->getMessage());
        }
    }

    /**
     * Get closure statistics
     * GET /api/v1/gym-closures/stats
     */
    public function stats() {
        // Require staff role or higher
        if (!$this->requireRole('staff')) return;

        try {
            $stats = $this->gymClosureModel->getStats();

            ResponseHelper::success([
                'stats' => $stats
            ], 'Closure statistics retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve closure statistics: ' . $e->getMessage());
        }
    }
}