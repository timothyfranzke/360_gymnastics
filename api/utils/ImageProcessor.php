<?php
/**
 * Image Processor Utility
 * Handles image resizing, optimization, and thumbnail creation
 */

class ImageProcessor {
    
    /**
     * Create thumbnail with proper aspect ratio
     */
    public static function createThumbnail($sourcePath, $destPath, $width = 300, $height = 300, $quality = 85) {
        try {
            // Get image info
            $imageInfo = getimagesize($sourcePath);
            if ($imageInfo === false) {
                return ['success' => false, 'errors' => ['Invalid image file']];
            }
            
            $sourceWidth = $imageInfo[0];
            $sourceHeight = $imageInfo[1];
            $sourceMimeType = $imageInfo['mime'];
            
            // Create source image resource
            $sourceImage = self::createImageFromFile($sourcePath, $sourceMimeType);
            if (!$sourceImage) {
                return ['success' => false, 'errors' => ['Failed to load source image']];
            }
            
            // Calculate dimensions for square thumbnail with crop
            $cropSize = min($sourceWidth, $sourceHeight);
            $offsetX = ($sourceWidth - $cropSize) / 2;
            $offsetY = ($sourceHeight - $cropSize) / 2;
            
            // Create thumbnail canvas
            $thumbnail = imagecreatetruecolor($width, $height);
            
            // Enable alpha blending for PNG transparency
            imagealphablending($thumbnail, false);
            imagesavealpha($thumbnail, true);
            
            // Set transparent background
            $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
            imagefill($thumbnail, 0, 0, $transparent);
            
            // Resample and crop to create thumbnail
            $success = imagecopyresampled(
                $thumbnail,
                $sourceImage,
                0, 0,                    // Destination x, y
                $offsetX, $offsetY,      // Source x, y (for centering crop)
                $width, $height,         // Destination width, height
                $cropSize, $cropSize     // Source width, height (cropped square)
            );
            
            if (!$success) {
                imagedestroy($sourceImage);
                imagedestroy($thumbnail);
                return ['success' => false, 'errors' => ['Failed to resize image']];
            }
            
            // Ensure destination directory exists
            $destDir = dirname($destPath);
            if (!is_dir($destDir)) {
                mkdir($destDir, 0755, true);
            }
            
            // Save thumbnail
            $saveSuccess = self::saveImage($thumbnail, $destPath, $sourceMimeType, $quality);
            
            // Clean up resources
            imagedestroy($sourceImage);
            imagedestroy($thumbnail);
            
            if (!$saveSuccess) {
                return ['success' => false, 'errors' => ['Failed to save thumbnail']];
            }
            
            // Set proper file permissions
            chmod($destPath, 0644);
            
            return [
                'success' => true,
                'path' => $destPath,
                'dimensions' => ['width' => $width, 'height' => $height],
                'size' => filesize($destPath)
            ];
            
        } catch (Exception $e) {
            error_log("Thumbnail creation error: " . $e->getMessage());
            return ['success' => false, 'errors' => ['An error occurred during thumbnail creation']];
        }
    }
    
    /**
     * Resize image to specific dimensions
     */
    public static function resizeImage($sourcePath, $destPath, $newWidth, $newHeight, $quality = 85) {
        try {
            // Get image info
            $imageInfo = getimagesize($sourcePath);
            if ($imageInfo === false) {
                return ['success' => false, 'errors' => ['Invalid image file']];
            }
            
            $sourceWidth = $imageInfo[0];
            $sourceHeight = $imageInfo[1];
            $sourceMimeType = $imageInfo['mime'];
            
            // Create source image resource
            $sourceImage = self::createImageFromFile($sourcePath, $sourceMimeType);
            if (!$sourceImage) {
                return ['success' => false, 'errors' => ['Failed to load source image']];
            }
            
            // Create destination image
            $destImage = imagecreatetruecolor($newWidth, $newHeight);
            
            // Enable alpha blending for PNG transparency
            imagealphablending($destImage, false);
            imagesavealpha($destImage, true);
            
            // Set transparent background
            $transparent = imagecolorallocatealpha($destImage, 255, 255, 255, 127);
            imagefill($destImage, 0, 0, $transparent);
            
            // Resize image
            $success = imagecopyresampled(
                $destImage,
                $sourceImage,
                0, 0, 0, 0,
                $newWidth, $newHeight,
                $sourceWidth, $sourceHeight
            );
            
            if (!$success) {
                imagedestroy($sourceImage);
                imagedestroy($destImage);
                return ['success' => false, 'errors' => ['Failed to resize image']];
            }
            
            // Ensure destination directory exists
            $destDir = dirname($destPath);
            if (!is_dir($destDir)) {
                mkdir($destDir, 0755, true);
            }
            
            // Save resized image
            $saveSuccess = self::saveImage($destImage, $destPath, $sourceMimeType, $quality);
            
            // Clean up resources
            imagedestroy($sourceImage);
            imagedestroy($destImage);
            
            if (!$saveSuccess) {
                return ['success' => false, 'errors' => ['Failed to save resized image']];
            }
            
            // Set proper file permissions
            chmod($destPath, 0644);
            
            return [
                'success' => true,
                'path' => $destPath,
                'dimensions' => ['width' => $newWidth, 'height' => $newHeight],
                'size' => filesize($destPath)
            ];
            
        } catch (Exception $e) {
            error_log("Image resize error: " . $e->getMessage());
            return ['success' => false, 'errors' => ['An error occurred during image resize']];
        }
    }
    
    /**
     * Optimize image for web (reduce file size while maintaining quality)
     */
    public static function optimizeImage($sourcePath, $destPath = null, $quality = 85) {
        if ($destPath === null) {
            $destPath = $sourcePath;
        }
        
        try {
            // Get image info
            $imageInfo = getimagesize($sourcePath);
            if ($imageInfo === false) {
                return ['success' => false, 'errors' => ['Invalid image file']];
            }
            
            $sourceMimeType = $imageInfo['mime'];
            
            // Create source image resource
            $sourceImage = self::createImageFromFile($sourcePath, $sourceMimeType);
            if (!$sourceImage) {
                return ['success' => false, 'errors' => ['Failed to load source image']];
            }
            
            // Save optimized image
            $saveSuccess = self::saveImage($sourceImage, $destPath, $sourceMimeType, $quality);
            
            // Clean up resources
            imagedestroy($sourceImage);
            
            if (!$saveSuccess) {
                return ['success' => false, 'errors' => ['Failed to save optimized image']];
            }
            
            return [
                'success' => true,
                'path' => $destPath,
                'size' => filesize($destPath)
            ];
            
        } catch (Exception $e) {
            error_log("Image optimization error: " . $e->getMessage());
            return ['success' => false, 'errors' => ['An error occurred during image optimization']];
        }
    }
    
    /**
     * Create image resource from file based on MIME type
     */
    private static function createImageFromFile($filepath, $mimeType) {
        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                return imagecreatefromjpeg($filepath);
            case 'image/png':
                return imagecreatefrompng($filepath);
            case 'image/webp':
                return imagecreatefromwebp($filepath);
            default:
                return false;
        }
    }
    
    /**
     * Save image resource to file based on MIME type
     */
    private static function saveImage($imageResource, $filepath, $mimeType, $quality = 85) {
        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                return imagejpeg($imageResource, $filepath, $quality);
            case 'image/png':
                // PNG uses compression level 0-9, convert quality (0-100) to compression level
                $compression = round((100 - $quality) / 11.111111);
                $compression = max(0, min(9, $compression));
                return imagepng($imageResource, $filepath, $compression);
            case 'image/webp':
                return imagewebp($imageResource, $filepath, $quality);
            default:
                return false;
        }
    }
    
    /**
     * Get image format from file path
     */
    public static function getImageFormat($filepath) {
        $imageInfo = getimagesize($filepath);
        if ($imageInfo === false) {
            return null;
        }
        
        return $imageInfo['mime'];
    }
    
    /**
     * Convert image to different format
     */
    public static function convertFormat($sourcePath, $destPath, $targetFormat, $quality = 85) {
        try {
            // Get source image info
            $sourceInfo = getimagesize($sourcePath);
            if ($sourceInfo === false) {
                return ['success' => false, 'errors' => ['Invalid source image']];
            }
            
            $sourceMimeType = $sourceInfo['mime'];
            
            // Validate target format
            $allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];
            if (!in_array($targetFormat, $allowedFormats)) {
                return ['success' => false, 'errors' => ['Unsupported target format']];
            }
            
            // Create source image resource
            $sourceImage = self::createImageFromFile($sourcePath, $sourceMimeType);
            if (!$sourceImage) {
                return ['success' => false, 'errors' => ['Failed to load source image']];
            }
            
            // Ensure destination directory exists
            $destDir = dirname($destPath);
            if (!is_dir($destDir)) {
                mkdir($destDir, 0755, true);
            }
            
            // Save in new format
            $saveSuccess = self::saveImage($sourceImage, $destPath, $targetFormat, $quality);
            
            // Clean up resources
            imagedestroy($sourceImage);
            
            if (!$saveSuccess) {
                return ['success' => false, 'errors' => ['Failed to save converted image']];
            }
            
            // Set proper file permissions
            chmod($destPath, 0644);
            
            return [
                'success' => true,
                'path' => $destPath,
                'format' => $targetFormat,
                'size' => filesize($destPath)
            ];
            
        } catch (Exception $e) {
            error_log("Image conversion error: " . $e->getMessage());
            return ['success' => false, 'errors' => ['An error occurred during image conversion']];
        }
    }
    
    /**
     * Check if GD extension supports required image formats
     */
    public static function checkGDSupport() {
        $support = [
            'gd_enabled' => extension_loaded('gd'),
            'jpeg' => function_exists('imagecreatefromjpeg'),
            'png' => function_exists('imagecreatefrompng'),
            'webp' => function_exists('imagecreatefromwebp')
        ];
        
        return $support;
    }
}