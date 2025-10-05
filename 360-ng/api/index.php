<?php
/**
 * 360 Gym Management API
 * Main entry point for the RESTful API
 */

// Enable CORS for frontend integration
$allowedOrigins = [
    'http://localhost:4200',  // Angular dev server
    'http://127.0.0.1:4200',  // Alternative localhost
    'http://localhost:3000',  // Alternative port
    'https://yourdomain.com'  // Production domain (update this)
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    // For development only - allow all origins without credentials
    header('Access-Control-Allow-Origin: *');
    // Note: Cannot use credentials with wildcard origin
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Access-Control-Max-Age: 86400'); // 24 hours
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Register error handler
require_once __DIR__ . '/utils/ErrorHandler.php';
ErrorHandler::register();

// Start session for authentication
session_start();

// Autoloader for classes
spl_autoload_register(function ($className) {
    $directories = [
        __DIR__ . '/controllers/',
        __DIR__ . '/models/',
        __DIR__ . '/middleware/',
        __DIR__ . '/utils/',
        __DIR__ . '/database/'
    ];
    
    foreach ($directories as $directory) {
        $file = $directory . $className . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Load configuration
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// Initialize database connection
try {
    $db = Database::getInstance();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Database connection failed',
        'details' => $e->getMessage()
    ]);
    exit();
}

// Include routes
require_once __DIR__ . '/routes/api.php';