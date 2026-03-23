<?php
/**
 * User Management Controller
 * Handles CRUD operations for user accounts
 */

class UserController extends BaseController {
    private $userModel;

    public function __construct($database) {
        parent::__construct($database);
        $this->userModel = new User($database);
    }

    /**
     * Get all users with pagination and filtering
     * GET /api/v1/users
     */
    public function index() {


        try {
            $pagination = $this->getPaginationParams();
            
            // Get filters from query params
            $search = $_GET['search'] ?? '';
            $role = $_GET['role'] ?? '';
            $sort_by = $_GET['sort_by'] ?? 'created_at';
            $sort_order = strtoupper($_GET['sort_order'] ?? 'DESC');

            // Build where clause
            $conditions = [];
            $values = [];

            if ($search) {
                $conditions[] = "(username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)";
                $searchTerm = "%$search%";
                $values = array_merge($values, array_fill(0, 4, $searchTerm));
            }

            if ($role && in_array($role, ['admin', 'staff', 'member'])) {
                $conditions[] = "role = ?";
                $values[] = $role;
            }

            // Base query
            $baseQuery = "SELECT id, username, email, role, first_name, last_name, is_active, 
                         last_login, created_at, updated_at FROM users";
            
            $whereClause = "";
            if (!empty($conditions)) {
                $whereClause = " WHERE " . implode(' AND ', $conditions);
            }

            // Validate sort fields
            $allowedSortFields = ['username', 'email', 'role', 'first_name', 'last_name', 'created_at', 'last_login'];
            if (!in_array($sort_by, $allowedSortFields)) {
                $sort_by = 'created_at';
            }

            if (!in_array($sort_order, ['ASC', 'DESC'])) {
                $sort_order = 'DESC';
            }

            $orderClause = " ORDER BY $sort_by $sort_order";
            
            // Count total
            $countQuery = "SELECT COUNT(*) FROM users" . $whereClause;
            $countStmt = $this->db->execute($countQuery, $values);
            $total = $countStmt->fetchColumn();
            
            // Get paginated results
            $query = $baseQuery . $whereClause . $orderClause . 
                    " LIMIT {$pagination['page_size']} OFFSET {$pagination['offset']}";
            
            $stmt = $this->db->execute($query, $values);
            $users = $stmt->fetchAll();
            
            $this->logActivity('users_list', ['filters' => compact('search', 'role', 'sort_by', 'sort_order')]);

            ResponseHelper::paginated(
                $users,
                $total,
                $pagination['page'],
                $pagination['page_size'],
                'Users retrieved successfully'
            );

        } catch (Exception $e) {
            $this->logActivity('users_list_error', $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve users: ' . $e->getMessage());
        }
    }

    /**
     * Get single user by ID
     * GET /api/v1/users/{id}
     */
    public function show($id) {
        if (!$this->requireRole('staff')) {
            return;
        }

        try {
            $user = $this->userModel->findById($id);
            
            if (!$user) {
                ResponseHelper::notFound('User not found');
                return;
            }

            $this->logActivity('user_view', ['user_id' => $id]);
            
            ResponseHelper::success([
                'user' => $user
            ], 'User retrieved successfully');

        } catch (Exception $e) {
            $this->logActivity('user_show_error', $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve user: ' . $e->getMessage());
        }
    }

    /**
     * Create new user
     * POST /api/v1/users (uses auth/register endpoint)
     */
    public function create() {
        if (!$this->requireRole('staff')) {
            return;
        }

        $data = $this->validate([
            'username' => ['required', 'minLength' => [3], 'maxLength' => [50]],
            'email' => ['required', 'email', 'maxLength' => [100]],
            'password' => ['required', 'minLength' => [6]],
            'first_name' => ['required', 'maxLength' => [50]],
            'last_name' => ['required', 'maxLength' => [50]],
            'role' => ['required', 'in' => [['admin', 'staff']]]
        ]);

        if (!$data) return;

        try {
            $user = $this->userModel->create($data);
            
            $this->logActivity('user_create', ['user_id' => $user['id'], 'username' => $user['username']]);
            
            ResponseHelper::success([
                'user' => $user
            ], 'User created successfully', 201);

        } catch (Exception $e) {
            $this->logActivity('user_create_error', $e->getMessage());
            
            if (strpos($e->getMessage(), 'already exists') !== false) {
                ResponseHelper::error($e->getMessage(), 409);
            } else {
                ResponseHelper::serverError('Failed to create user: ' . $e->getMessage());
            }
        }
    }

    /**
     * Update user
     * PUT /api/v1/users/{id}
     */
    public function update($id) {
        if (!$this->requireRole('admin')) {
            return;
        }

        // Admin cannot edit themselves
        $currentUser = $this->getCurrentUser();
        if ($currentUser && $currentUser['user_id'] == $id) {
            ResponseHelper::error('Cannot edit your own account', 403);
            return;
        }

        $data = $this->validate([
            'username' => ['required', 'minLength' => [3], 'maxLength' => [50]],
            'email' => ['required', 'email', 'maxLength' => [100]],
            'first_name' => ['required', 'maxLength' => [50]],
            'last_name' => ['required', 'maxLength' => [50]],
            'role' => ['required', 'in' => [['admin', 'staff']]]
        ]);

        if (!$data) return;

        try {
            // Check if user exists
            $existingUser = $this->userModel->findById($id);
            if (!$existingUser) {
                ResponseHelper::notFound('User not found');
                return;
            }

            // Check for duplicate username/email (excluding current user)
            $checkUsername = $this->userModel->findByUsername($data['username']);
            if ($checkUsername && $checkUsername['id'] != $id) {
                ResponseHelper::error('Username already exists', 409);
                return;
            }

            $checkEmail = $this->userModel->findByEmail($data['email']);
            if ($checkEmail && $checkEmail['id'] != $id) {
                ResponseHelper::error('Email already exists', 409);
                return;
            }

            // Handle password update if provided
            if (isset($data['password']) && !empty($data['password'])) {
                $this->userModel->updatePassword($id, $data['password']);
                unset($data['password']); // Remove from general update
            }

            $user = $this->userModel->update($id, $data);
            
            $this->logActivity('user_update', ['user_id' => $id]);
            
            ResponseHelper::success([
                'user' => $user
            ], 'User updated successfully');

        } catch (Exception $e) {
            $this->logActivity('user_update_error', $e->getMessage());
            ResponseHelper::serverError('Failed to update user: ' . $e->getMessage());
        }
    }

    /**
     * Delete user (soft delete)
     * DELETE /api/v1/users/{id}
     */
    public function delete($id) {
        if (!$this->requireRole('admin')) {
            return;
        }

        // Admin cannot delete themselves
        $currentUser = $this->getCurrentUser();
        if ($currentUser && $currentUser['user_id'] == $id) {
            ResponseHelper::error('Cannot delete your own account', 403);
            return;
        }

        try {
            $user = $this->userModel->findById($id);
            
            if (!$user) {
                ResponseHelper::notFound('User not found');
                return;
            }

            $this->userModel->delete($id);
            
            $this->logActivity('user_delete', ['user_id' => $id, 'username' => $user['username']]);
            
            ResponseHelper::success(null, 'User deleted successfully');

        } catch (Exception $e) {
            $this->logActivity('user_delete_error', $e->getMessage());
            ResponseHelper::serverError('Failed to delete user: ' . $e->getMessage());
        }
    }

    /**
     * Get user statistics
     * GET /api/v1/users/stats
     */
    public function stats() {
        if (!$this->requireRole('admin') && !$this->requireRole('staff')) {
            return;
        }

        try {
            $stats = $this->userModel->getStats();
            
            $this->logActivity('user_stats');
            
            ResponseHelper::success($stats, 'User statistics retrieved successfully');

        } catch (Exception $e) {
            $this->logActivity('user_stats_error', $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve user statistics: ' . $e->getMessage());
        }
    }

    /**
     * Reset user password (admin only)
     * POST /api/v1/users/{id}/reset-password
     */
    public function resetPassword($id) {
        if (!$this->requireRole('admin')) {
            return;
        }

        $data = $this->validate([
            'new_password' => ['required', 'minLength' => [6]]
        ]);

        if (!$data) return;

        try {
            $user = $this->userModel->findById($id);
            
            if (!$user) {
                ResponseHelper::notFound('User not found');
                return;
            }

            $this->userModel->updatePassword($id, $data['new_password']);
            
            $this->logActivity('user_password_reset', ['user_id' => $id]);
            
            ResponseHelper::success(null, 'Password reset successfully');

        } catch (Exception $e) {
            $this->logActivity('user_password_reset_error', $e->getMessage());
            ResponseHelper::serverError('Failed to reset password: ' . $e->getMessage());
        }
    }
}