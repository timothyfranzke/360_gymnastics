<?php
/**
 * Test Gallery Cleanup Script
 * Direct test of cleanup functionality to debug server issues
 */

// Load configuration
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/models/Gallery.php';

try {
    // Initialize database connection
    $db = Database::getInstance();
    
    echo "Testing Gallery Cleanup...\n";
    echo "========================\n\n";
    
    // Create Gallery model instance
    $galleryModel = new Gallery($db);
    
    // Show current gallery contents
    echo "Current gallery contents:\n";
    $images = $galleryModel->getAll();
    foreach ($images as $image) {
        echo "- ID: {$image['id']}, Filename: {$image['filename']}, Original: {$image['original_filename']}\n";
    }
    echo "\n";
    
    // Run cleanup
    echo "Running cleanup...\n";
    $result = $galleryModel->cleanupSampleData();
    
    echo "Cleanup results:\n";
    echo "- Original count: {$result['original_count']}\n";
    echo "- Deleted count: {$result['deleted_count']}\n";
    echo "- Remaining count: {$result['remaining_count']}\n\n";
    
    // Show remaining gallery contents
    echo "Remaining gallery contents:\n";
    $images = $galleryModel->getAll();
    if (empty($images)) {
        echo "No images remaining\n";
    } else {
        foreach ($images as $image) {
            echo "- ID: {$image['id']}, Filename: {$image['filename']}, Original: {$image['original_filename']}\n";
        }
    }
    
    echo "\n✅ Test completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
?>