<?php
/**
 * Gallery Cleanup Script
 * Removes sample data from gallery table so only GUID-named uploads remain
 */

// Load configuration
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

try {
    // Initialize database connection
    $db = Database::getInstance();
    
    echo "Gallery Cleanup Script\n";
    echo "=====================\n\n";
    
    // Count current images
    $stmt = $db->execute("SELECT COUNT(*) as count FROM gallery");
    $result = $stmt->fetch();
    $currentCount = $result['count'];
    
    echo "Current images in gallery: {$currentCount}\n";
    
    // Delete all sample data (images with non-GUID filenames)
    // GUID filenames have the pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.ext
    $stmt = $db->execute("
        DELETE FROM gallery 
        WHERE filename NOT REGEXP '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.'
    ");
    
    $deletedCount = $stmt->rowCount();
    
    echo "Deleted {$deletedCount} sample images\n";
    
    // Count remaining images
    $stmt = $db->execute("SELECT COUNT(*) as count FROM gallery");
    $result = $stmt->fetch();
    $remainingCount = $result['count'];
    
    echo "Remaining images (with GUID filenames): {$remainingCount}\n\n";
    
    if ($remainingCount > 0) {
        echo "Remaining images:\n";
        $stmt = $db->execute("SELECT id, filename, original_filename FROM gallery ORDER BY created_at DESC");
        while ($row = $stmt->fetch()) {
            echo "- ID: {$row['id']}, File: {$row['filename']}, Original: {$row['original_filename']}\n";
        }
    } else {
        echo "Gallery is now empty. Upload new images to see them with proper GUID filenames.\n";
    }
    
    echo "\n✅ Cleanup completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>