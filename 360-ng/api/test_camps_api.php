<?php
/**
 * Test script for Camps API
 * Simple script to test the camps API endpoints
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include necessary files
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// Autoloader
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

echo "=== Camps API Test Script ===\n\n";

try {
    // Initialize database
    $db = Database::getInstance();
    echo "✓ Database connection successful\n";

    // Initialize camp model
    $campModel = new Camp($db);
    echo "✓ Camp model initialized\n\n";

    // Test 1: Get all camps
    echo "Test 1: Get all camps\n";
    $camps = $campModel->getAll();
    echo "Found " . count($camps) . " camps\n";
    foreach ($camps as $camp) {
        echo "- {$camp['title']} ({$camp['date']}) - \${$camp['cost']}\n";
    }
    echo "\n";

    // Test 2: Get active camps
    echo "Test 2: Get active camps\n";
    $activeCamps = $campModel->getActive();
    echo "Found " . count($activeCamps) . " active camps\n";
    foreach ($activeCamps as $camp) {
        echo "- {$camp['title']} (Active: " . ($camp['is_active'] ? 'Yes' : 'No') . ")\n";
    }
    echo "\n";

    // Test 3: Get upcoming camps
    echo "Test 3: Get upcoming camps\n";
    $upcomingCamps = $campModel->getUpcoming();
    echo "Found " . count($upcomingCamps) . " upcoming camps\n";
    foreach ($upcomingCamps as $camp) {
        echo "- {$camp['title']} ({$camp['date']})\n";
    }
    echo "\n";

    // Test 4: Get camp statistics
    echo "Test 4: Get camp statistics\n";
    $stats = $campModel->getStats();
    echo "Total: {$stats['total']}\n";
    echo "Active: {$stats['active']}\n";
    echo "Upcoming: {$stats['upcoming']}\n";
    echo "This Month: {$stats['this_month']}\n\n";

    // Test 5: Get specific camp
    echo "Test 5: Get specific camp (ID: 1)\n";
    $camp = $campModel->getById(1);
    if ($camp) {
        echo "Found: {$camp['title']}\n";
        echo "Date: {$camp['date']}\n";
        echo "Cost: \${$camp['cost']}\n";
        echo "Description: " . substr($camp['description'], 0, 50) . "...\n";
        echo "Time: {$camp['time']}\n";
        echo "Registration: {$camp['registration_link']}\n";
    } else {
        echo "Camp not found\n";
    }
    echo "\n";

    // Test 6: Test search functionality
    echo "Test 6: Search camps (keyword: 'camp')\n";
    $searchResults = $campModel->getAll(['search' => 'camp']);
    echo "Found " . count($searchResults) . " camps matching 'camp'\n";
    foreach ($searchResults as $camp) {
        echo "- {$camp['title']}\n";
    }
    echo "\n";

    // Test 7: Test date filtering
    echo "Test 7: Filter camps by date (from 2024-01-01)\n";
    $dateFiltered = $campModel->getAll(['date_from' => '2024-01-01']);
    echo "Found " . count($dateFiltered) . " camps from 2024-01-01\n";
    foreach ($dateFiltered as $camp) {
        echo "- {$camp['title']} ({$camp['date']})\n";
    }
    echo "\n";

    echo "=== All tests completed successfully! ===\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
}