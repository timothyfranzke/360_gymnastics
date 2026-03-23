<?php
/**
 * Gym Hours Controller
 * Handles gym operating hours management
 */

class GymHoursController extends BaseController {
    private $gymHoursModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->gymHoursModel = new GymHours($database);
    }

    /**
     * Get all gym hours
     * GET /api/v1/gym-hours
     */
    public function index() {
        try {
            $hours = $this->gymHoursModel->getAll();

            ResponseHelper::success([
                'gym_hours' => $hours
            ], 'Gym hours retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve gym hours: ' . $e->getMessage());
        }
    }

    /**
     * Get current week's hours
     * GET /api/v1/gym-hours/week
     */
    public function week() {
        try {
            $weekHours = $this->gymHoursModel->getCurrentWeekHours();

            ResponseHelper::success([
                'week_hours' => $weekHours,
                'week_start' => date('Y-m-d', strtotime('monday this week')),
                'week_end' => date('Y-m-d', strtotime('sunday this week'))
            ], 'Current week gym hours retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve week hours: ' . $e->getMessage());
        }
    }

    /**
     * Get current status (open/closed)
     * GET /api/v1/gym-hours/status
     */
    public function status() {
        try {
            $status = $this->gymHoursModel->getCurrentDayStatus();
            $nextOpening = null;
            
            // If closed, get next opening time
            if (!$status['is_open']) {
                $nextOpening = $this->gymHoursModel->getNextOpening();
            }

            $response = [
                'current_status' => $status
            ];
            
            if ($nextOpening) {
                $response['next_opening'] = $nextOpening;
            }

            ResponseHelper::success($response, 'Gym status retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve gym status: ' . $e->getMessage());
        }
    }

    /**
     * Get hours for specific day
     * GET /api/v1/gym-hours/{day}
     */
    public function show($day) {
        try {
            $hours = $this->gymHoursModel->getByDay($day);

            if (!$hours) {
                ResponseHelper::notFound('Hours not found for the specified day');
                return;
            }

            ResponseHelper::success([
                'hours' => $hours
            ], "Hours for $day retrieved successfully");

        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Invalid day') !== false) {
                ResponseHelper::error($e->getMessage(), 400);
            } else {
                ResponseHelper::serverError('Failed to retrieve hours: ' . $e->getMessage());
            }
        }
    }

    /**
     * Update hours for specific day
     * PUT /api/v1/gym-hours/{day}
     */
    public function update($day) {
        // Require admin role
        if (!$this->requireRole('admin')) return;

        $data = $this->validate([
            'open_time' => ['regex' => ['/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', 'Invalid time format. Use HH:MM:SS']],
            'close_time' => ['regex' => ['/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', 'Invalid time format. Use HH:MM:SS']],
            'is_closed' => ['boolean']
        ]);

        if (!$data) return;

        // Additional validation
        $validationErrors = $this->gymHoursModel->validateHours($data);
        if (!empty($validationErrors)) {
            ResponseHelper::validationError($validationErrors);
            return;
        }

        try {
            $updatedHours = $this->gymHoursModel->updateDay($day, $data);

            $this->logActivity('gym_hours_updated', [
                'day' => $day,
                'updated_fields' => array_keys($data)
            ]);

            ResponseHelper::updated([
                'hours' => $updatedHours
            ], "Hours for $day updated successfully");

        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Invalid day') !== false) {
                ResponseHelper::error($e->getMessage(), 400);
            } else {
                ResponseHelper::serverError('Failed to update hours: ' . $e->getMessage());
            }
        }
    }

    /**
     * Update multiple days at once
     * PUT /api/v1/gym-hours/bulk
     */
    public function bulkUpdate() {
        // Require admin role
        if (!$this->requireRole('admin')) return;

        $input = $this->getInput();
        
        if (!isset($input['hours']) || !is_array($input['hours'])) {
            ResponseHelper::error('Invalid input format. Expected "hours" array', 400);
            return;
        }

        // Validate each day's data
        $validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $validatedHours = [];
        
        foreach ($input['hours'] as $dayData) {
            if (!isset($dayData['day_of_week'])) {
                ResponseHelper::error('Missing day_of_week for one or more entries', 400);
                return;
            }
            
            $day = strtolower($dayData['day_of_week']);
            if (!in_array($day, $validDays)) {
                ResponseHelper::error("Invalid day: $day", 400);
                return;
            }
            
            // Validate times and closed status
            $errors = $this->gymHoursModel->validateHours($dayData);
            if (!empty($errors)) {
                ResponseHelper::validationError($errors);
                return;
            }
            
            $validatedHours[] = $dayData;
        }

        try {
            $updatedHours = $this->gymHoursModel->updateMultiple($validatedHours);
            
            $updatedDays = array_map(function($h) { return $h['day_of_week']; }, $updatedHours);

            $this->logActivity('gym_hours_bulk_updated', [
                'updated_days' => $updatedDays,
                'total_days' => count($updatedDays)
            ]);

            ResponseHelper::updated([
                'updated_hours' => $updatedHours,
                'updated_days' => $updatedDays
            ], 'Gym hours updated successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to update gym hours: ' . $e->getMessage());
        }
    }

    /**
     * Reset to default hours
     * POST /api/v1/gym-hours/reset
     */
    public function reset() {
        // Require admin role
        if (!$this->requireRole('admin')) return;

        try {
            $defaultHours = $this->gymHoursModel->resetToDefault();

            $this->logActivity('gym_hours_reset', [
                'action' => 'reset_to_default',
                'days_updated' => count($defaultHours)
            ]);

            ResponseHelper::success([
                'hours' => $defaultHours
            ], 'Gym hours reset to default successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to reset gym hours: ' . $e->getMessage());
        }
    }

    /**
     * Get gym hours statistics
     * GET /api/v1/gym-hours/stats
     */
    public function stats() {
        // Require staff role or higher
        if (!$this->requireRole('staff')) return;

        try {
            $stats = $this->gymHoursModel->getStats();

            ResponseHelper::success([
                'stats' => $stats
            ], 'Gym hours statistics retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve gym hours statistics: ' . $e->getMessage());
        }
    }

    /**
     * Check if gym is open at specific time
     * GET /api/v1/gym-hours/check?day={day}&time={time}
     */
    public function checkTime() {
        $day = $_GET['day'] ?? null;
        $time = $_GET['time'] ?? null;

        if (!$day || !$time) {
            ResponseHelper::error('Day and time parameters are required', 400);
            return;
        }

        // Validate time format
        if (!preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/', $time)) {
            ResponseHelper::error('Invalid time format. Use HH:MM:SS', 400);
            return;
        }

        try {
            $isOpen = $this->gymHoursModel->isOpenAt($day, $time);
            $hours = $this->gymHoursModel->getByDay($day);

            ResponseHelper::success([
                'day' => $day,
                'time' => $time,
                'is_open' => $isOpen,
                'hours' => $hours,
                'message' => $isOpen ? 'Gym is open at this time' : 'Gym is closed at this time'
            ], 'Time check completed successfully');

        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Invalid day') !== false) {
                ResponseHelper::error($e->getMessage(), 400);
            } else {
                ResponseHelper::serverError('Failed to check time: ' . $e->getMessage());
            }
        }
    }

    /**
     * Get next opening time
     * GET /api/v1/gym-hours/next-opening
     */
    public function nextOpening() {
        try {
            $nextOpening = $this->gymHoursModel->getNextOpening();

            ResponseHelper::success([
                'next_opening' => $nextOpening
            ], 'Next opening time retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::serverError('Failed to retrieve next opening time: ' . $e->getMessage());
        }
    }
}