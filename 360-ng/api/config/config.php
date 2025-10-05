<?php
/**
 * Configuration settings for 360 Gym API
 */

// Environment configuration
define('ENV', 'development'); // Change to 'production' for live environment

// Database configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'gym_360');
define('DB_USER', getenv('DB_USER') ?: '360_user');
define('DB_PASS', getenv('DB_PASS') ?: 'Password1@');
define('DB_CHARSET', 'utf8');

// JWT configuration
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'your-super-secret-jwt-key-change-this-in-production');
define('JWT_EXPIRE', getenv('JWT_EXPIRE') ?: 3600); // 1 hour in seconds
define('JWT_ALGORITHM', 'HS256');

// API configuration
define('API_VERSION', 'v1');
define('API_PREFIX', '/api/' . API_VERSION);

// Security configuration
define('PASSWORD_MIN_LENGTH', 8);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutes in seconds

// Rate limiting configuration
define('RATE_LIMIT_REQUESTS', 100); // Requests per window
define('RATE_LIMIT_WINDOW', 3600); // Time window in seconds (1 hour)

// File upload configuration
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('UPLOAD_PATH', __DIR__ . '/../uploads/');

// Staff photo upload configuration
define('STAFF_PHOTO_MAX_SIZE', 5 * 1024 * 1024); // 5MB
define('STAFF_PHOTO_ALLOWED_TYPES', ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
define('STAFF_PHOTO_MIN_WIDTH', 200);
define('STAFF_PHOTO_MIN_HEIGHT', 200);
define('STAFF_PHOTO_MAX_WIDTH', 2000);
define('STAFF_PHOTO_MAX_HEIGHT', 2000);
define('STAFF_PHOTO_THUMBNAIL_SIZE', 300);
define('STAFF_PHOTO_QUALITY', 85);

// Pagination defaults
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Timezone
date_default_timezone_set('America/New_York');

// Error handling
if (ENV === 'production') {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../logs/error.log');
}

// CORS origins (add your frontend domains here)
define('ALLOWED_ORIGINS', [
    'http://localhost:4200',
    'https://yourdomain.com'
]);

// Security headers
function setSecurityHeaders() {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    if (ENV === 'production') {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }
}

setSecurityHeaders();