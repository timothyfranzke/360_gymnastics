<?php
/**
 * User Model
 * Handles user data operations and authentication
 */

class User {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Create new user
     */
    public function create($userData) {
        try {
            $this->db->beginTransaction();

            // Check if username already exists
            if ($this->findByUsername($userData['username'])) {
                throw new Exception('Username already exists');
            }

            // Check if email already exists
            if ($this->findByEmail($userData['email'])) {
                throw new Exception('Email already exists');
            }

            $sql = "INSERT INTO users (username, email, password_hash, role, first_name, last_name) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->db->execute($sql, [
                $userData['username'],
                $userData['email'],
                PasswordHelper::hash($userData['password']),
                $userData['role'] ?? 'member',
                $userData['first_name'],
                $userData['last_name']
            ]);

            $userId = $this->db->lastInsertId();
            $this->db->commit();

            return $this->findById($userId);

        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * Find user by ID
     */
    public function findById($id) {
        $sql = "SELECT id, username, email, role, first_name, last_name, is_active, 
                       login_attempts, locked_until, last_login, created_at, updated_at 
                FROM users WHERE id = ? AND is_active = 1";
        
        $stmt = $this->db->execute($sql, [$id]);
        return $stmt->fetch();
    }

    /**
     * Find user by username
     */
    public function findByUsername($username) {
        $sql = "SELECT id, username, email, password_hash, role, first_name, last_name, 
                       is_active, login_attempts, locked_until, last_login, created_at 
                FROM users WHERE username = ?";
        
        $stmt = $this->db->execute($sql, [$username]);
        return $stmt->fetch();
    }

    /**
     * Find user by email
     */
    public function findByEmail($email) {
        $sql = "SELECT id, username, email, password_hash, role, first_name, last_name, 
                       is_active, login_attempts, locked_until, last_login, created_at 
                FROM users WHERE email = ?";
        
        $stmt = $this->db->execute($sql, [$email]);
        return $stmt->fetch();
    }

    /**
     * Authenticate user
     */
    public function authenticate($username, $password) {
        $user = $this->findByUsername($username) ?: $this->findByEmail($username);
        
        if (!$user) {
            throw new Exception('Invalid credentials');
        }

        // Check if account is locked
        if ($this->isAccountLocked($user)) {
            throw new Exception('Account is temporarily locked due to too many failed login attempts');
        }

        // Check if account is active
        if (!$user['is_active']) {
            throw new Exception('Account is deactivated');
        }

        // Verify password
        if (!PasswordHelper::verify($password, $user['password_hash'])) {
            $this->incrementLoginAttempts($user['id']);
            throw new Exception('Invalid credentials');
        }

        // Reset login attempts and update last login
        $this->resetLoginAttempts($user['id']);
        $this->updateLastLogin($user['id']);

        // Remove sensitive data
        unset($user['password_hash'], $user['login_attempts'], $user['locked_until']);
        
        return $user;
    }

    /**
     * Update user
     */
    public function update($id, $userData) {
        $allowedFields = ['email', 'first_name', 'last_name', 'role', 'is_active'];
        $fields = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (isset($userData[$field])) {
                $fields[] = "$field = ?";
                $values[] = $userData[$field];
            }
        }

        if (empty($fields)) {
            throw new Exception('No valid fields to update');
        }

        $values[] = $id;
        $sql = "UPDATE users SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        
        $this->db->execute($sql, $values);
        return $this->findById($id);
    }

    /**
     * Update password
     */
    public function updatePassword($id, $newPassword, $currentPassword = null) {
        if ($currentPassword) {
            $user = $this->findById($id);
            $userWithPassword = $this->findByUsername($user['username']);
            
            if (!PasswordHelper::verify($currentPassword, $userWithPassword['password_hash'])) {
                throw new Exception('Current password is incorrect');
            }
        }

        $passwordHash = PasswordHelper::hash($newPassword);
        $sql = "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        
        $this->db->execute($sql, [$passwordHash, $id]);
        return true;
    }

    /**
     * Get all users with pagination
     */
    public function getAll($pagination, $search = '') {
        $baseQuery = "SELECT id, username, email, role, first_name, last_name, is_active, 
                             last_login, created_at FROM users";
        
        $conditions = [];
        $values = [];
        
        if ($search) {
            $conditions[] = "(username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)";
            $searchTerm = "%$search%";
            $values = array_fill(0, 4, $searchTerm);
        }
        
        $query = $baseQuery;
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }
        $query .= " ORDER BY created_at DESC";
        
        // Count total
        $countQuery = str_replace('SELECT id, username, email, role, first_name, last_name, is_active, last_login, created_at', 'SELECT COUNT(*)', $query);
        $countStmt = $this->db->execute($countQuery, $values);
        $total = $countStmt->fetchColumn();
        
        // Get paginated results
        $query .= " LIMIT {$pagination['page_size']} OFFSET {$pagination['offset']}";
        $stmt = $this->db->execute($query, $values);
        $users = $stmt->fetchAll();
        
        return [
            'users' => $users,
            'total' => $total
        ];
    }

    /**
     * Delete user (soft delete)
     */
    public function delete($id) {
        $sql = "UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $this->db->execute($sql, [$id]);
        return true;
    }

    /**
     * Check if account is locked
     */
    private function isAccountLocked($user) {
        if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
            return true;
        }
        return false;
    }

    /**
     * Increment login attempts
     */
    private function incrementLoginAttempts($userId) {
        $sql = "UPDATE users SET login_attempts = login_attempts + 1 WHERE id = ?";
        $this->db->execute($sql, [$userId]);

        // Lock account if too many attempts
        $user = $this->findById($userId);
        if ($user && isset($user['login_attempts']) && $user['login_attempts'] >= MAX_LOGIN_ATTEMPTS) {
            $lockUntil = date('Y-m-d H:i:s', time() + LOGIN_LOCKOUT_TIME);
            $this->db->execute(
                "UPDATE users SET locked_until = ? WHERE id = ?",
                [$lockUntil, $userId]
            );
        }
    }

    /**
     * Reset login attempts
     */
    private function resetLoginAttempts($userId) {
        $sql = "UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?";
        $this->db->execute($sql, [$userId]);
    }

    /**
     * Update last login timestamp
     */
    private function updateLastLogin($userId) {
        $sql = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        $this->db->execute($sql, [$userId]);
    }

    /**
     * Get user statistics
     */
    public function getStats() {
        $sql = "SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
                    COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff_users,
                    COUNT(CASE WHEN role = 'member' THEN 1 END) as member_users
                FROM users";
        
        $stmt = $this->db->execute($sql);
        return $stmt->fetch();
    }
}