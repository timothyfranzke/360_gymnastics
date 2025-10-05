<?php
/**
 * Test script for file upload functionality
 * This file is for development/testing only and should be removed in production
 */

// Only allow access in development mode
if (!defined('ENV') || ENV !== 'development') {
    http_response_code(404);
    exit('Not found');
}

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/utils/FileUploadUtility.php';
require_once __DIR__ . '/utils/ImageProcessor.php';

echo "<h2>File Upload System Test</h2>";

// Test 1: Check GD support
echo "<h3>1. GD Library Support</h3>";
$gdSupport = ImageProcessor::checkGDSupport();
foreach ($gdSupport as $feature => $supported) {
    $status = $supported ? '✓' : '✗';
    echo "{$status} {$feature}: " . ($supported ? 'Supported' : 'Not supported') . "<br>";
}

// Test 2: Check directory permissions
echo "<h3>2. Directory Permissions</h3>";
$uploadDir = UPLOAD_PATH . 'staff/';
$thumbnailDir = UPLOAD_PATH . 'staff/thumbnails/';

$dirs = [
    'Upload directory' => $uploadDir,
    'Thumbnail directory' => $thumbnailDir
];

foreach ($dirs as $name => $dir) {
    if (is_dir($dir)) {
        $writable = is_writable($dir);
        $status = $writable ? '✓' : '✗';
        echo "{$status} {$name}: " . ($writable ? 'Writable' : 'Not writable') . "<br>";
    } else {
        echo "✗ {$name}: Directory does not exist<br>";
    }
}

// Test 3: Configuration values
echo "<h3>3. Configuration</h3>";
$configs = [
    'UPLOAD_PATH' => UPLOAD_PATH,
    'MAX_FILE_SIZE' => MAX_FILE_SIZE . ' bytes (' . round(MAX_FILE_SIZE / 1024 / 1024, 2) . ' MB)',
    'STAFF_PHOTO_MAX_SIZE' => STAFF_PHOTO_MAX_SIZE . ' bytes (' . round(STAFF_PHOTO_MAX_SIZE / 1024 / 1024, 2) . ' MB)',
    'STAFF_PHOTO_MIN_WIDTH' => STAFF_PHOTO_MIN_WIDTH . 'px',
    'STAFF_PHOTO_MIN_HEIGHT' => STAFF_PHOTO_MIN_HEIGHT . 'px',
    'STAFF_PHOTO_MAX_WIDTH' => STAFF_PHOTO_MAX_WIDTH . 'px',
    'STAFF_PHOTO_MAX_HEIGHT' => STAFF_PHOTO_MAX_HEIGHT . 'px',
    'STAFF_PHOTO_THUMBNAIL_SIZE' => STAFF_PHOTO_THUMBNAIL_SIZE . 'px',
    'STAFF_PHOTO_QUALITY' => STAFF_PHOTO_QUALITY . '%'
];

foreach ($configs as $name => $value) {
    echo "• {$name}: {$value}<br>";
}

echo "<h3>4. Upload Test Form</h3>";
echo '<form method="post" enctype="multipart/form-data">';
echo '<p>Test User ID: <input type="number" name="user_id" value="1" required></p>';
echo '<p>Select image: <input type="file" name="photo" accept="image/jpeg,image/jpg,image/png,image/webp" required></p>';
echo '<p><input type="submit" name="test_upload" value="Test Upload"></p>';
echo '</form>';

// Process test upload
if (isset($_POST['test_upload']) && isset($_FILES['photo'])) {
    echo "<h3>5. Upload Test Results</h3>";
    
    $userId = intval($_POST['user_id']);
    $result = FileUploadUtility::uploadStaffPhoto($_FILES['photo'], $userId);
    
    if ($result['success']) {
        echo "✓ Upload successful!<br>";
        echo "• Filename: {$result['filename']}<br>";
        echo "• Path: {$result['path']}<br>";
        echo "• Size: " . round($result['size'] / 1024, 2) . " KB<br>";
        echo "• Dimensions: {$result['dimensions']['width']}x{$result['dimensions']['height']}px<br>";
        echo "• URL: <a href='{$result['url']}' target='_blank'>{$result['url']}</a><br>";
        echo "• Thumbnail URL: <a href='{$result['thumbnail_url']}' target='_blank'>{$result['thumbnail_url']}</a><br>";
        
        // Display images
        echo "<h4>Images:</h4>";
        echo "<p>Original: <br><img src='{$result['url']}' style='max-width: 300px; border: 1px solid #ccc;'></p>";
        echo "<p>Thumbnail: <br><img src='{$result['thumbnail_url']}' style='border: 1px solid #ccc;'></p>";
    } else {
        echo "✗ Upload failed:<br>";
        foreach ($result['errors'] as $error) {
            echo "• {$error}<br>";
        }
    }
}

echo "<p><strong>Note:</strong> This test file should be removed in production.</p>";
?>