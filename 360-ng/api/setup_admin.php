<?php
/**
 * Setup script to create initial admin user
 */

// Include required files
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/PasswordHelper.php';

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

try {
    $db = Database::getInstance();
    $userModel = new User($db);
    
    // Check if admin user already exists
    $existingAdmin = $userModel->findByUsername('admin2');
    
    if ($existingAdmin) {
        echo json_encode([
            'success' => true,
            'message' => 'Admin user already exists'
        ]);
        exit;
    }
    
    // Create admin user
    $adminData = [
        'username' => 'admin2',
        'email' => 'admin2@360gym.com',
        'password' => 'admin123!',
        'first_name' => 'System',
        'last_name' => 'Administrator',
        'role' => 'admin'
    ];
    
    $userId = $userModel->create($adminData);
    
    if ($userId) {
        echo json_encode([
            'success' => true,
            'message' => 'Admin user created successfully',
            'data' => [
                'id' => $userId,
                'username' => 'admin2',
                'email' => 'admin2@360gym.com',
                'credentials' => [
                    'username' => 'admin2',
                    'password' => 'admin123!'
                ]
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create admin user'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => true,
        'message' => 'Setup failed: ' . $e->getMessage()
    ]);
}