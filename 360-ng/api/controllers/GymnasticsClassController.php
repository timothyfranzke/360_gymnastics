<?php
/**
 * GymnasticsClass Controller
 * Handles HTTP requests for gymnastics class management
 */

class GymnasticsClassController extends BaseController {
    private $classModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->classModel = new GymnasticsClass($database);
    }

    /**
     * GET /classes - Get all classes with pagination and filters
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
                'featured' => isset($_GET['featured']) ? (bool) $_GET['featured'] : null,
                'age_range' => $_GET['age_range'] ?? null
            ];

            // Remove null values from filters
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            // Get total count and paginated data
            $total = $this->classModel->getCount($filters);
            $classes = $this->classModel->getAll($filters, $pagination);

            ResponseHelper::paginated(
                $classes,
                $total,
                $pagination['page'],
                $pagination['page_size'],
                'Classes retrieved successfully'
            );

        } catch (Exception $e) {
            error_log("Error in GymnasticsClassController::index: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve classes');
        }
    }

    /**
     * GET /classes/featured - Get featured classes (public endpoint)
     */
    public function featured() {
        try {
            $classes = $this->classModel->getFeatured();
            ResponseHelper::success($classes, 'Featured classes retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in GymnasticsClassController::featured: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve featured classes');
        }
    }

    /**
     * GET /classes/search - Search classes
     */
    public function search() {
        try {
            $query = $_GET['q'] ?? $_GET['search'] ?? '';
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : null;

            if (empty($query)) {
                ResponseHelper::error('Search query is required', 400);
                return;
            }

            $classes = $this->classModel->search($query, $limit);
            ResponseHelper::success($classes, 'Search completed successfully');

        } catch (Exception $e) {
            error_log("Error in GymnasticsClassController::search: " . $e->getMessage());
            ResponseHelper::serverError('Failed to search classes');
        }
    }

    /**
     * GET /classes/{id} - Get specific class
     */
    public function show($id) {
        try {
            if (empty($id)) {
                ResponseHelper::error('Invalid class ID', 400);
                return;
            }

            $class = $this->classModel->getById($id);

            if (!$class) {
                ResponseHelper::notFound('Class not found');
                return;
            }

            ResponseHelper::success($class, 'Class retrieved successfully');

        } catch (Exception $e) {
            error_log("Error in GymnasticsClassController::show: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve class');
        }
    }

    /**
     * POST /classes - Create new class
     */
    public function create() {
        try {
            // Check authentication for admin operations
            if (!$this->isAuthenticated()) {
                ResponseHelper::unauthorized();
                return;
            }

            $input = $this->getJsonInput();
            
            // Validate required fields
            $errors = $this->validateClassData($input, true);
            if (!empty($errors)) {
                ResponseHelper::error('Validation failed', 400, ['errors' => $errors]);
                return;
            }

            // Check if class ID already exists
            if ($this->classModel->exists($input['id'])) {
                ResponseHelper::error('A class with this ID already exists', 400);
                return;
            }

            // Create the class
            $result = $this->classModel->create($input);

            if ($result) {
                $class = $this->classModel->getById($input['id']);
                ResponseHelper::success($class, 'Class created successfully', 201);
            } else {
                ResponseHelper::serverError('Failed to create class');
            }

        } catch (Exception $e) {
            error_log("Error in GymnasticsClassController::create: " . $e->getMessage());
            ResponseHelper::serverError('Failed to create class');
        }
    }

    /**
     * PUT /classes/{id} - Update class
     */
    public function update($id) {
        try {
            // Check authentication for admin operations
            if (!$this->isAuthenticated()) {
                ResponseHelper::unauthorized();
                return;
            }

            if (empty($id)) {
                ResponseHelper::error('Invalid class ID', 400);
                return;
            }

            // Check if class exists
            $existingClass = $this->classModel->getById($id);
            if (!$existingClass) {
                ResponseHelper::notFound('Class not found');
                return;
            }

            $input = $this->getJsonInput();
            
            // Validate input data (partial validation for updates)
            $errors = $this->validateClassData($input, false);
            if (!empty($errors)) {
                ResponseHelper::error('Validation failed', 400, ['errors' => $errors]);
                return;
            }

            // Update the class
            $result = $this->classModel->update($id, $input);

            if ($result) {
                $class = $this->classModel->getById($id);
                ResponseHelper::success($class, 'Class updated successfully');
            } else {
                ResponseHelper::serverError('Failed to update class');
            }

        } catch (Exception $e) {
            error_log("Error in GymnasticsClassController::update: " . $e->getMessage());
            ResponseHelper::serverError('Failed to update class');
        }
    }

    /**
     * DELETE /classes/{id} - Delete class
     */
    public function delete($id) {
        try {
            // Check authentication for admin operations
            if (!$this->isAuthenticated()) {
                ResponseHelper::unauthorized();
                return;
            }

            if (empty($id)) {
                ResponseHelper::error('Invalid class ID', 400);
                return;
            }

            // Check if class exists
            $existingClass = $this->classModel->getById($id);
            if (!$existingClass) {
                ResponseHelper::notFound('Class not found');
                return;
            }

            // Delete the class
            $result = $this->classModel->delete($id);

            if ($result) {
                ResponseHelper::success(null, 'Class deleted successfully');
            } else {
                ResponseHelper::serverError('Failed to delete class');
            }

        } catch (Exception $e) {
            error_log("Error in GymnasticsClassController::delete: " . $e->getMessage());
            ResponseHelper::serverError('Failed to delete class');
        }
    }

    /**
     * Validate class data
     */
    private function validateClassData($data, $isCreate = true) {
        $errors = [];

        // Required fields for creation
        if ($isCreate) {
            if (empty($data['id'])) {
                $errors['id'] = 'Class ID is required';
            } elseif (!preg_match('/^[a-z0-9-]+$/', $data['id'])) {
                $errors['id'] = 'Class ID must contain only lowercase letters, numbers, and hyphens';
            }

            if (empty($data['name'])) {
                $errors['name'] = 'Class name is required';
            }

            if (empty($data['age_range'])) {
                $errors['age_range'] = 'Age range is required';
            }

            if (empty($data['description'])) {
                $errors['description'] = 'Description is required';
            }
        }

        // Optional validation for updates and creates
        if (isset($data['name']) && strlen($data['name']) > 255) {
            $errors['name'] = 'Class name must be less than 255 characters';
        }

        if (isset($data['age_range']) && strlen($data['age_range']) > 100) {
            $errors['age_range'] = 'Age range must be less than 100 characters';
        }

        if (isset($data['description']) && strlen($data['description']) > 2000) {
            $errors['description'] = 'Description must be less than 2000 characters';
        }

        if (isset($data['url']) && !empty($data['url'])) {
            if (!filter_var($data['url'], FILTER_VALIDATE_URL) && !preg_match('/^\/[a-zA-Z0-9\-_\/]*$/', $data['url'])) {
                $errors['url'] = 'URL must be a valid URL or relative path';
            }
        }

        if (isset($data['ratio']) && !empty($data['ratio']) && strlen($data['ratio']) > 20) {
            $errors['ratio'] = 'Ratio must be less than 20 characters';
        }

        if (isset($data['duration']) && !empty($data['duration']) && strlen($data['duration']) > 50) {
            $errors['duration'] = 'Duration must be less than 50 characters';
        }

        // Validate array fields
        if (isset($data['skills']) && !is_array($data['skills'])) {
            $errors['skills'] = 'Skills must be an array';
        }

        if (isset($data['structure']) && !is_array($data['structure'])) {
            $errors['structure'] = 'Structure must be an array';
        }

        if (isset($data['prerequisites']) && !is_array($data['prerequisites'])) {
            $errors['prerequisites'] = 'Prerequisites must be an array';
        }

        if (isset($data['featured']) && !is_bool($data['featured'])) {
            $errors['featured'] = 'Featured must be a boolean value';
        }

        return $errors;
    }
}