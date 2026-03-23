<?php
/**
 * Events Controller
 * Handles HTTP requests for event management
 */

class EventsController extends BaseController {
    private $eventModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->eventModel = new Event($database);
    }

    /**
     * GET /events - Get all events with pagination and filters
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
            $total = $this->eventModel->getCount($filters);
            $events = $this->eventModel->getAll($filters, $pagination);

            ResponseHelper::paginated(
                $events,
                $total,
                $pagination['page'],
                $pagination['page_size'],
                'Events retrieved successfully'
            );

        } catch (Exception $e) {
            error_log("Error in EventsController::index: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve events');
        }
    }

    /**
     * GET /events/active - Get active events (public endpoint)
     */
    public function active() {
        try {
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;
            $events = $this->eventModel->getActive($limit);

            ResponseHelper::success($events, 'Active events retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in EventsController::active: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve active events');
        }
    }

    /**
     * GET /events/upcoming - Get upcoming events (public endpoint)
     */
    public function upcoming() {
        try {
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;
            $events = $this->eventModel->getUpcoming($limit);

            ResponseHelper::success($events, 'Upcoming events retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in EventsController::upcoming: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve upcoming events');
        }
    }

    /**
     * GET /events/{id} - Get specific event
     */
    public function show($id) {
        try {
            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid event ID', 400);
                return;
            }

            $event = $this->eventModel->getById($id);

            if (!$event) {
                ResponseHelper::notFound('Event not found');
                return;
            }

            ResponseHelper::success($event, 'Event retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in EventsController::show: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve event');
        }
    }

    /**
     * POST /events - Create new event
     */
    public function create() {
        try {
            // Require admin role for creating events
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
            $eventDate = new DateTime($data['date']);
            $today = new DateTime();
            if ($eventDate < $today) {
                ResponseHelper::error('Event date cannot be in the past', 400);
                return;
            }

            $event = $this->eventModel->create($data);

            $this->logActivity('create_event', ['event_id' => $event['id'], 'title' => $event['title']]);
            ResponseHelper::created($event, 'Event created successfully');

        } catch (Exception $e) {
            error_log("Error in EventsController::create: " . $e->getMessage());
            ResponseHelper::serverError('Failed to create event');
        }
    }

    /**
     * PUT /events/{id} - Update event
     */
    public function update($id) {
        try {
            // Require admin role for updating events
            if (!$this->requireRole('admin')) {
                return;
            }

            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid event ID', 400);
                return;
            }

            if (!$this->eventModel->exists($id)) {
                ResponseHelper::notFound('Event not found');
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
                $eventDate = new DateTime($data['date']);
                $today = new DateTime();
                if ($eventDate < $today) {
                    ResponseHelper::error('Event date cannot be in the past', 400);
                    return;
                }
            }

            $event = $this->eventModel->update($id, $data);

            $this->logActivity('update_event', ['event_id' => $id, 'updates' => array_keys($data)]);
            ResponseHelper::updated($event, 'Event updated successfully');

        } catch (Exception $e) {
            error_log("Error in EventsController::update: " . $e->getMessage());
            ResponseHelper::serverError('Failed to update event');
        }
    }

    /**
     * DELETE /events/{id} - Delete event
     */
    public function delete($id) {
        try {
            // Require admin role for deleting events
            if (!$this->requireRole('admin')) {
                return;
            }

            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid event ID', 400);
                return;
            }

            if (!$this->eventModel->exists($id)) {
                ResponseHelper::notFound('Event not found');
                return;
            }

            $success = $this->eventModel->delete($id);

            if ($success) {
                $this->logActivity('delete_event', ['event_id' => $id]);
                ResponseHelper::deleted('Event deleted successfully');
            } else {
                ResponseHelper::serverError('Failed to delete event');
            }

        } catch (Exception $e) {
            error_log("Error in EventsController::delete: " . $e->getMessage());
            ResponseHelper::serverError('Failed to delete event');
        }
    }

    /**
     * GET /events/stats - Get event statistics
     */
    public function stats() {
        try {
            // Require admin role for viewing stats
            if (!$this->requireRole('admin')) {
                return;
            }

            $stats = $this->eventModel->getStats();
            ResponseHelper::success($stats, 'Event statistics retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in EventsController::stats: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve event statistics');
        }
    }

    /**
     * PATCH /events/{id}/toggle - Toggle event active status
     */
    public function toggle($id) {
        try {
            // Require admin role for toggling events
            if (!$this->requireRole('admin')) {
                return;
            }

            if (!is_numeric($id)) {
                ResponseHelper::error('Invalid event ID', 400);
                return;
            }

            $event = $this->eventModel->getById($id);
            if (!$event) {
                ResponseHelper::notFound('Event not found');
                return;
            }

            $newStatus = !$event['is_active'];
            $updatedEvent = $this->eventModel->update($id, ['is_active' => $newStatus]);

            $action = $newStatus ? 'activated' : 'deactivated';
            $this->logActivity('toggle_event', ['event_id' => $id, 'action' => $action]);
            
            ResponseHelper::updated($updatedEvent, "Event $action successfully");

        } catch (Exception $e) {
            error_log("Error in EventsController::toggle: " . $e->getMessage());
            ResponseHelper::serverError('Failed to toggle event status');
        }
    }
}