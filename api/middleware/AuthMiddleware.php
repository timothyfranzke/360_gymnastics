<?php
/**
 * Authentication Middleware
 * Validates JWT tokens and manages user authentication
 */

class AuthMiddleware {
    private $jwtHandler;
    private $excludedRoutes = [
        '/api/v1/auth/login',
        '/360gym/api/v1/auth/login',
        '/api/v1/contact',
        '/360gym/api/v1/contact',
        '/api/v1/auth/register',
        '/api/v1/parties',
        '/360gym/api/v1/auth/register',
        '/api/v1/migrate',
        '/360gym/api/v1/migrate',
        '/migrate',
        '/360gym/api/migrate'
    ];

    public function __construct($database) {
        $this->jwtHandler = new JWTHandler($database);
    }

    /**
     * Handle authentication
     */
    public function handle() {
        $requestUri = $_SERVER['REQUEST_URI'];
        $method = $_SERVER['REQUEST_METHOD'];

        // Skip authentication for OPTIONS requests and excluded routes
        if ($method === 'OPTIONS' || $this->isExcludedRoute($requestUri)) {
            return true;
        }

        try {
            $token = $this->getTokenFromRequest();

            // For GET requests, token is optional but we'll validate if provided
            if (!$token) {
                if ($method === 'GET') {
                    // Allow GET requests without token (public endpoints)
                    return true;
                }
                ResponseHelper::unauthorized('Token not provided');
                return false;
            }

            $payload = $this->jwtHandler->validateToken($token);

            // Set user data for controllers
            $_SESSION['user'] = $payload['data'];
            $_SESSION['token_jti'] = $payload['jti'];

            return true;

        } catch (Exception $e) {
            // For GET requests with invalid token, allow through (public endpoints)
            if ($method === 'GET') {
                return true;
            }
            ResponseHelper::unauthorized($e->getMessage());
            return false;
        }
    }

    /**
     * Check if route is excluded from authentication
     */
    private function isExcludedRoute($uri) {
        foreach ($this->excludedRoutes as $route) {
            if (strpos($uri, $route) === 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get token from request headers
     */
    private function getTokenFromRequest() {
        $headers = getallheaders();
        
        // Check Authorization header
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        
        // Check for token in query parameter (not recommended for production)
        if (isset($_GET['token'])) {
            return $_GET['token'];
        }
        
        return null;
    }

    /**
     * Get current authenticated user
     */
    public static function getCurrentUser() {
        return $_SESSION['user'] ?? null;
    }

    /**
     * Check if user has required role
     */
    public static function hasRole($requiredRole) {
        $user = self::getCurrentUser();
        if (!$user) {
            return false;
        }

        $roleHierarchy = [
            'member' => 1,
            'staff' => 2,
            'admin' => 3
        ];

        $userRole = $user['role'] ?? 'member';
        
        return ($roleHierarchy[$userRole] ?? 0) >= ($roleHierarchy[$requiredRole] ?? 0);
    }

    /**
     * Require specific role or higher
     */
    public static function requireRole($requiredRole) {
        if (!self::hasRole($requiredRole)) {
            ResponseHelper::forbidden('Insufficient permissions. Required role: ' . $requiredRole);
            return false;
        }
        return true;
    }

    /**
     * Require admin role
     */
    public static function requireAdmin() {
        return self::requireRole('admin');
    }

    /**
     * Require staff role or higher
     */
    public static function requireStaff() {
        return self::requireRole('staff');
    }
}