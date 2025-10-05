<?php
/**
 * Authentication Controller
 * Handles user authentication, registration, and token management
 */

class AuthController extends BaseController {
    private $userModel;
    private $jwtHandler;

    public function __construct($database) {
        parent::__construct($database);
        $this->userModel = new User($database);
        $this->jwtHandler = new JWTHandler($database);
    }

    /**
     * User login
     * POST /api/v1/auth/login
     */
    public function login() {
        $data = $this->validate([
            'username' => ['required'],
            'password' => ['required']
        ]);

        if (!$data) return;

        try {
            $user = $this->userModel->authenticate($data['username'], $data['password']);
            
            // Generate JWT token
            $tokenData = $this->jwtHandler->generateToken(
                $user['id'],
                $user['username'],
                $user['role']
            );

            $this->logActivity('login', ['user_id' => $user['id'], 'username' => $user['username']]);

            ResponseHelper::success([
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name']
                ],
                'token' => $tokenData['token'],
                'expires_at' => date('c', $tokenData['expires_at'])
            ], 'Login successful');

        } catch (Exception $e) {
            $this->logActivity('login_failed', ['username' => $data['username'], 'error' => $e->getMessage()]);
            ResponseHelper::error($e->getMessage(), 401);
        }
    }

    /**
     * User registration
     * POST /api/v1/auth/register
     */
    public function register() {
        $data = $this->validate([
            'username' => ['required', 'minLength' => [3], 'maxLength' => [50]],
            'email' => ['required', 'email'],
            'password' => ['required', 'minLength' => [PASSWORD_MIN_LENGTH]],
            'first_name' => ['required', 'maxLength' => [50]],
            'last_name' => ['required', 'maxLength' => [50]],
            'role' => ['in' => [['member', 'staff', 'admin']]]
        ]);

        if (!$data) return;

        // Validate password strength
        $passwordValidation = PasswordHelper::validateStrength($data['password']);
        if (!$passwordValidation['is_valid']) {
            ResponseHelper::validationError(['password' => $passwordValidation['errors']]);
            return;
        }

        // Only admins can create admin/staff accounts
        if (isset($data['role']) && in_array($data['role'], ['admin', 'staff'])) {
            if (!$this->hasRole('admin')) {
                ResponseHelper::forbidden('Only administrators can create admin or staff accounts');
                return;
            }
        }

        try {
            $user = $this->userModel->create($data);
            
            $this->logActivity('user_registered', [
                'new_user_id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]);

            ResponseHelper::created([
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name']
                ]
            ], 'User registered successfully');

        } catch (Exception $e) {
            ResponseHelper::error($e->getMessage(), 400);
        }
    }

    /**
     * User logout
     * POST /api/v1/auth/logout
     */
    public function logout() {
        try {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
                $this->jwtHandler->blacklistToken($token);
            }

            $user = $this->getCurrentUser();
            $this->logActivity('logout', ['user_id' => $user['user_id'] ?? null]);

            // Clear session
            session_destroy();

            ResponseHelper::success(null, 'Logout successful');

        } catch (Exception $e) {
            ResponseHelper::error('Logout failed: ' . $e->getMessage(), 400);
        }
    }

    /**
     * Refresh token
     * POST /api/v1/auth/refresh
     */
    public function refresh() {
        try {
            $user = $this->getCurrentUser();
            
            if (!$user) {
                ResponseHelper::unauthorized('No valid session found');
                return;
            }

            // Generate new token
            $tokenData = $this->jwtHandler->generateToken(
                $user['user_id'],
                $user['username'],
                $user['role']
            );

            // Blacklist current token
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $currentToken = $matches[1];
                $this->jwtHandler->blacklistToken($currentToken);
            }

            ResponseHelper::success([
                'token' => $tokenData['token'],
                'expires_at' => date('c', $tokenData['expires_at'])
            ], 'Token refreshed successfully');

        } catch (Exception $e) {
            ResponseHelper::error('Token refresh failed: ' . $e->getMessage(), 400);
        }
    }

    /**
     * Get current user profile
     * GET /api/v1/auth/profile
     */
    public function profile() {
        try {
            $currentUser = $this->getCurrentUser();
            
            if (!$currentUser) {
                ResponseHelper::unauthorized('No valid session found');
                return;
            }

            $user = $this->userModel->findById($currentUser['user_id']);
            
            if (!$user) {
                ResponseHelper::notFound('User not found');
                return;
            }

            ResponseHelper::success([
                'user' => $user
            ], 'Profile retrieved successfully');

        } catch (Exception $e) {
            ResponseHelper::error('Failed to retrieve profile: ' . $e->getMessage(), 400);
        }
    }

    /**
     * Update user profile
     * PUT /api/v1/auth/profile
     */
    public function updateProfile() {
        $data = $this->validate([
            'email' => ['email'],
            'first_name' => ['maxLength' => [50]],
            'last_name' => ['maxLength' => [50]]
        ]);

        if (!$data) return;

        try {
            $currentUser = $this->getCurrentUser();
            
            if (!$currentUser) {
                ResponseHelper::unauthorized('No valid session found');
                return;
            }

            $updatedUser = $this->userModel->update($currentUser['user_id'], $data);
            
            $this->logActivity('profile_updated', [
                'user_id' => $currentUser['user_id'],
                'updated_fields' => array_keys($data)
            ]);

            ResponseHelper::updated([
                'user' => $updatedUser
            ], 'Profile updated successfully');

        } catch (Exception $e) {
            ResponseHelper::error('Failed to update profile: ' . $e->getMessage(), 400);
        }
    }

    /**
     * Change password
     * PUT /api/v1/auth/password
     */
    public function changePassword() {
        $data = $this->validate([
            'current_password' => ['required'],
            'new_password' => ['required', 'minLength' => [PASSWORD_MIN_LENGTH]],
            'confirm_password' => ['required']
        ]);

        if (!$data) return;

        // Check if passwords match
        if ($data['new_password'] !== $data['confirm_password']) {
            ResponseHelper::validationError(['confirm_password' => ['Passwords do not match']]);
            return;
        }

        // Validate password strength
        $passwordValidation = PasswordHelper::validateStrength($data['new_password']);
        if (!$passwordValidation['is_valid']) {
            ResponseHelper::validationError(['new_password' => $passwordValidation['errors']]);
            return;
        }

        try {
            $currentUser = $this->getCurrentUser();
            
            if (!$currentUser) {
                ResponseHelper::unauthorized('No valid session found');
                return;
            }

            $this->userModel->updatePassword(
                $currentUser['user_id'],
                $data['new_password'],
                $data['current_password']
            );

            $this->logActivity('password_changed', ['user_id' => $currentUser['user_id']]);

            ResponseHelper::success(null, 'Password changed successfully');

        } catch (Exception $e) {
            ResponseHelper::error('Failed to change password: ' . $e->getMessage(), 400);
        }
    }

    /**
     * Verify token (for frontend validation)
     * GET /api/v1/auth/verify
     */
    public function verify() {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            ResponseHelper::unauthorized('Invalid or expired token');
            return;
        }

        ResponseHelper::success([
            'valid' => true,
            'user' => $user
        ], 'Token is valid');
    }
}