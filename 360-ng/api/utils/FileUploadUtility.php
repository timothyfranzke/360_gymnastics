<?php
/**
 * File Upload Utility
 * Handles secure file upload operations with validation and security measures
 */

class FileUploadUtility {
    private static $allowedMimeTypes = [
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp'
    ];
    
    private static $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    private static $maxFileSize = 5242880; // 5MB in bytes
    private static $minWidth = 200;
    private static $minHeight = 200;
    private static $maxWidth = 2000;
    private static $maxHeight = 2000;

    /**
     * Validate uploaded file
     */
    public static function validateFile($file) {
        $errors = [];

        // Check if file was uploaded without errors
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            switch ($file['error']) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $errors[] = 'File is too large. Maximum size is ' . (self::$maxFileSize / 1024 / 1024) . 'MB';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errors[] = 'File was only partially uploaded';
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $errors[] = 'No file was uploaded';
                    break;
                case UPLOAD_ERR_NO_TMP_DIR:
                case UPLOAD_ERR_CANT_WRITE:
                case UPLOAD_ERR_EXTENSION:
                    $errors[] = 'Server error during file upload';
                    break;
                default:
                    $errors[] = 'Unknown upload error';
            }
            return ['valid' => false, 'errors' => $errors];
        }

        // Check file size
        if ($file['size'] > self::$maxFileSize) {
            $errors[] = 'File is too large. Maximum size is ' . (self::$maxFileSize / 1024 / 1024) . 'MB';
        }

        if ($file['size'] <= 0) {
            $errors[] = 'File is empty';
        }

        // Get file extension from original filename
        $originalExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        // Validate file extension
        if (!in_array($originalExtension, self::$allowedExtensions)) {
            $errors[] = 'Invalid file type. Allowed types: ' . implode(', ', self::$allowedExtensions);
        }

        // Check MIME type
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        
        if (!array_key_exists($mimeType, self::$allowedMimeTypes)) {
            $errors[] = 'Invalid file type detected. File must be a valid image';
        }

        // Validate it's actually an image and get dimensions
        $imageInfo = getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            $errors[] = 'File is not a valid image';
        } else {
            $width = $imageInfo[0];
            $height = $imageInfo[1];
            
            // Check dimensions
            if ($width < self::$minWidth || $height < self::$minHeight) {
                $errors[] = "Image dimensions too small. Minimum size: {self::$minWidth}x{self::$minHeight}px";
            }
            
            if ($width > self::$maxWidth || $height > self::$maxHeight) {
                $errors[] = "Image dimensions too large. Maximum size: {self::$maxWidth}x{self::$maxHeight}px";
            }
        }

        // Additional security check - scan for malicious content
        if (self::containsMaliciousContent($file['tmp_name'])) {
            $errors[] = 'File contains potentially malicious content';
        }

        if (!empty($errors)) {
            return ['valid' => false, 'errors' => $errors];
        }

        return [
            'valid' => true,
            'mime_type' => $mimeType,
            'extension' => self::$allowedMimeTypes[$mimeType],
            'dimensions' => ['width' => $width, 'height' => $height],
            'size' => $file['size']
        ];
    }

    /**
     * Generate GUID-based filename
     */
    public static function generateSecureFilename($userId, $extension) {
        // Generate a proper GUID (UUID v4)
        $guid = sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
        return "{$guid}.{$extension}";
    }

    /**
     * Generate GUID-based filename for anonymous uploads
     */
    public static function generateAnonymousFilename($extension) {
        // Generate a proper GUID (UUID v4)
        $guid = sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
        return "{$guid}.{$extension}";
    }

    /**
     * Upload and process file
     */
    public static function uploadStaffPhoto($file, $userId) {
        // Validate file
        $validation = self::validateFile($file);
        if (!$validation['valid']) {
            return ['success' => false, 'errors' => $validation['errors']];
        }

        try {
            // Generate secure filename
            $filename = self::generateSecureFilename($userId, $validation['extension']);
            $uploadPath = UPLOAD_PATH . 'staff/' . $filename;
            $thumbnailPath = UPLOAD_PATH . 'staff/thumbnails/' . $filename;

            // Check if upload directory exists and is writable
            $uploadDir = dirname($uploadPath);
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            if (!is_writable($uploadDir)) {
                return ['success' => false, 'errors' => ['Upload directory is not writable']];
            }

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
                return ['success' => false, 'errors' => ['Failed to move uploaded file']];
            }

            // Set proper file permissions
            chmod($uploadPath, 0644);

            // Create thumbnail
            $thumbnailResult = ImageProcessor::createThumbnail($uploadPath, $thumbnailPath, 300, 300);
            if (!$thumbnailResult['success']) {
                // If thumbnail creation fails, log error but don't fail the upload
                error_log("Failed to create thumbnail for {$filename}: " . implode(', ', $thumbnailResult['errors']));
            }

            return [
                'success' => true,
                'filename' => $filename,
                'path' => 'uploads/staff/' . $filename,
                'thumbnail_path' => 'uploads/staff/thumbnails/' . $filename,
                'url' => '/api/v1/files/staff/' . $filename,
                'thumbnail_url' => '/api/v1/files/staff/thumbnails/' . $filename,
                'size' => $validation['size'],
                'dimensions' => $validation['dimensions']
            ];

        } catch (Exception $e) {
            error_log("File upload error: " . $e->getMessage());
            return ['success' => false, 'errors' => ['An error occurred during file upload']];
        }
    }

    /**
     * Upload photo anonymously (for use during staff creation)
     */
    public static function uploadAnonymousStaffPhoto($file) {
        // Validate file
        $validation = self::validateFile($file);
        if (!$validation['valid']) {
            return ['success' => false, 'errors' => $validation['errors']];
        }

        try {
            // Generate secure filename without user ID
            $filename = self::generateAnonymousFilename($validation['extension']);
            $uploadPath = UPLOAD_PATH . 'staff/' . $filename;
            $thumbnailPath = UPLOAD_PATH . 'staff/thumbnails/' . $filename;

            // Check if upload directory exists and is writable
            $uploadDir = dirname($uploadPath);
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            if (!is_writable($uploadDir)) {
                return ['success' => false, 'errors' => ['Upload directory is not writable']];
            }

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
                return ['success' => false, 'errors' => ['Failed to move uploaded file']];
            }

            // Set proper file permissions
            chmod($uploadPath, 0644);

            // Create thumbnail
            $thumbnailResult = ImageProcessor::createThumbnail($uploadPath, $thumbnailPath, 300, 300);
            if (!$thumbnailResult['success']) {
                // If thumbnail creation fails, log error but don't fail the upload
                error_log("Failed to create thumbnail for {$filename}: " . implode(', ', $thumbnailResult['errors']));
            }

            return [
                'success' => true,
                'filename' => $filename,
                'path' => 'uploads/staff/' . $filename,
                'thumbnail_path' => 'uploads/staff/thumbnails/' . $filename,
                'url' => '/api/v1/files/staff/' . $filename,
                'thumbnail_url' => '/api/v1/files/staff/thumbnails/' . $filename,
                'size' => $validation['size'],
                'dimensions' => $validation['dimensions']
            ];

        } catch (Exception $e) {
            error_log("Anonymous file upload error: " . $e->getMessage());
            return ['success' => false, 'errors' => ['An error occurred during file upload']];
        }
    }

    /**
     * Delete staff photo and thumbnail
     */
    public static function deleteStaffPhoto($filename) {
        if (empty($filename)) {
            return true;
        }

        $success = true;
        
        // Extract just the filename from path if full path is provided
        $filename = basename($filename);
        
        // Delete main file
        $mainPath = UPLOAD_PATH . 'staff/' . $filename;
        if (file_exists($mainPath)) {
            if (!unlink($mainPath)) {
                error_log("Failed to delete staff photo: {$mainPath}");
                $success = false;
            }
        }

        // Delete thumbnail
        $thumbnailPath = UPLOAD_PATH . 'staff/thumbnails/' . $filename;
        if (file_exists($thumbnailPath)) {
            if (!unlink($thumbnailPath)) {
                error_log("Failed to delete staff photo thumbnail: {$thumbnailPath}");
                $success = false;
            }
        }

        return $success;
    }

    /**
     * Get file info
     */
    public static function getFileInfo($filename) {
        if (empty($filename)) {
            return null;
        }

        $filename = basename($filename);
        $filePath = UPLOAD_PATH . 'staff/' . $filename;
        
        if (!file_exists($filePath)) {
            return null;
        }

        $imageInfo = getimagesize($filePath);
        
        return [
            'filename' => $filename,
            'path' => 'uploads/staff/' . $filename,
            'thumbnail_path' => 'uploads/staff/thumbnails/' . $filename,
            'url' => '/api/v1/files/staff/' . $filename,
            'thumbnail_url' => '/api/v1/files/staff/thumbnails/' . $filename,
            'size' => filesize($filePath),
            'dimensions' => $imageInfo ? ['width' => $imageInfo[0], 'height' => $imageInfo[1]] : null,
            'last_modified' => filemtime($filePath)
        ];
    }

    /**
     * Clean up old files for user (when replacing photo)
     * Note: With GUID naming, we now rely on the staff model to track which files belong to which user
     */
    public static function cleanupOldFiles($oldImagePath = null) {
        // Delete the old image file if it exists
        if ($oldImagePath && !empty($oldImagePath)) {
            $filename = basename($oldImagePath);
            self::deleteStaffPhoto($filename);
        }
    }

    /**
     * Check for malicious content in file
     */
    private static function containsMaliciousContent($filePath) {
        // Read first few bytes to check for script tags or PHP code
        $handle = fopen($filePath, 'r');
        if (!$handle) {
            return true; // If we can't read the file, consider it suspicious
        }
        
        $content = fread($handle, 1024); // Read first 1KB
        fclose($handle);
        
        // Check for common script patterns
        $maliciousPatterns = [
            '/<\?php/i',
            '/<script/i',
            '/javascript:/i',
            '/vbscript:/i',
            '/onload=/i',
            '/onerror=/i',
            '/eval\(/i',
            '/base64_decode/i'
        ];
        
        foreach ($maliciousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Upload and process gallery image
     */
    public static function uploadGalleryImage($file) {
        // Validate file
        $validation = self::validateFile($file);
        if (!$validation['valid']) {
            return ['success' => false, 'errors' => $validation['errors']];
        }

        try {
            // Generate secure filename
            $filename = self::generateAnonymousFilename($validation['extension']);
            $uploadPath = UPLOAD_PATH . 'gallery/' . $filename;
            $thumbnailPath = UPLOAD_PATH . 'gallery/thumbnails/' . $filename;

            // Check if upload directory exists and is writable
            $uploadDir = dirname($uploadPath);
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $thumbnailDir = dirname($thumbnailPath);
            if (!is_dir($thumbnailDir)) {
                mkdir($thumbnailDir, 0755, true);
            }
            
            if (!is_writable($uploadDir)) {
                return ['success' => false, 'errors' => ['Upload directory is not writable']];
            }

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
                return ['success' => false, 'errors' => ['Failed to move uploaded file']];
            }

            // Set proper file permissions
            chmod($uploadPath, 0644);

            // Create thumbnail
            $thumbnailResult = ImageProcessor::createThumbnail($uploadPath, $thumbnailPath, 400, 400);
            if (!$thumbnailResult['success']) {
                // If thumbnail creation fails, log error but don't fail the upload
                error_log("Failed to create thumbnail for {$filename}: " . implode(', ', $thumbnailResult['errors']));
            }

            return [
                'success' => true,
                'filename' => $filename,
                'path' => 'uploads/gallery/' . $filename,
                'thumbnail_path' => 'uploads/gallery/thumbnails/' . $filename,
                'url' => '/api/v1/files/gallery/' . $filename,
                'thumbnail_url' => '/api/v1/files/gallery/thumbnails/' . $filename,
                'size' => $validation['size'],
                'dimensions' => $validation['dimensions']
            ];

        } catch (Exception $e) {
            error_log("Gallery file upload error: " . $e->getMessage());
            return ['success' => false, 'errors' => ['An error occurred during file upload']];
        }
    }

    /**
     * Delete gallery image and thumbnail
     */
    public static function deleteGalleryImage($filename) {
        if (empty($filename)) {
            return true;
        }

        $success = true;
        
        // Extract just the filename from path if full path is provided
        $filename = basename($filename);
        
        // Delete main file
        $mainPath = UPLOAD_PATH . 'gallery/' . $filename;
        if (file_exists($mainPath)) {
            if (!unlink($mainPath)) {
                error_log("Failed to delete gallery image: {$mainPath}");
                $success = false;
            }
        }

        // Delete thumbnail
        $thumbnailPath = UPLOAD_PATH . 'gallery/thumbnails/' . $filename;
        if (file_exists($thumbnailPath)) {
            if (!unlink($thumbnailPath)) {
                error_log("Failed to delete gallery image thumbnail: {$thumbnailPath}");
                $success = false;
            }
        }

        return $success;
    }

    /**
     * Serve gallery file securely
     */
    public static function serveGalleryFile($filename, $type = 'main') {
        $filename = basename($filename); // Security: prevent directory traversal
        
        if ($type === 'thumbnail') {
            $filePath = UPLOAD_PATH . 'gallery/thumbnails/' . $filename;
        } else {
            $filePath = UPLOAD_PATH . 'gallery/' . $filename;
        }
        
        if (!file_exists($filePath)) {
            http_response_code(404);
            exit('File not found');
        }
        
        // Get MIME type
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($filePath);
        
        // Verify it's still a valid image
        if (!in_array($mimeType, array_keys(self::$allowedMimeTypes))) {
            http_response_code(403);
            exit('Invalid file type');
        }
        
        // Set CORS headers first
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        
        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
        
        // Set content headers
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        header('Content-Disposition: inline; filename="' . $filename . '"');
        header('Cache-Control: public, max-age=31536000'); // Cache for 1 year
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($filePath)) . ' GMT');
        
        // Security headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        
        // Output file
        readfile($filePath);
        exit;
    }

    /**
     * Serve file securely
     */
    public static function serveFile($filename, $type = 'main') {
        $filename = basename($filename); // Security: prevent directory traversal
        
        if ($type === 'thumbnail') {
            $filePath = UPLOAD_PATH . 'staff/thumbnails/' . $filename;
        } else {
            $filePath = UPLOAD_PATH . 'staff/' . $filename;
        }
        
        if (!file_exists($filePath)) {
            http_response_code(404);
            exit('File not found');
        }
        
        // Get MIME type
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($filePath);
        
        // Verify it's still a valid image
        if (!in_array($mimeType, array_keys(self::$allowedMimeTypes))) {
            http_response_code(403);
            exit('Invalid file type');
        }
        
        // Set CORS headers first
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        
        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
        
        // Set content headers
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        header('Content-Disposition: inline; filename="' . $filename . '"');
        header('Cache-Control: public, max-age=31536000'); // Cache for 1 year
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s', filemtime($filePath)) . ' GMT');
        
        // Security headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        
        // Output file
        readfile($filePath);
        exit;
    }
}