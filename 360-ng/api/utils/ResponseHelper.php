<?php
/**
 * Response Helper
 * Standardized API response formatting
 */

class ResponseHelper {
    
    /**
     * Send JSON response
     */
    public static function json($data, $statusCode = 200, $headers = []) {
        http_response_code($statusCode);
        
        // Set default headers
        header('Content-Type: application/json');
        
        // Set additional headers
        foreach ($headers as $key => $value) {
            header("$key: $value");
        }
        
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }

    /**
     * Send success response
     */
    public static function success($data = null, $message = 'Success', $statusCode = 200) {
        $response = [
            'success' => true,
            'message' => $message,
            'timestamp' => date('c')
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        self::json($response, $statusCode);
    }

    /**
     * Send error response
     */
    public static function error($message, $statusCode = 400, $errors = null, $data = null) {
        $response = [
            'success' => false,
            'error' => true,
            'message' => $message,
            'timestamp' => date('c')
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        self::json($response, $statusCode);
    }

    /**
     * Send validation error response
     */
    public static function validationError($errors, $message = 'Validation failed') {
        self::error($message, 422, $errors);
    }

    /**
     * Send unauthorized response
     */
    public static function unauthorized($message = 'Unauthorized access') {
        self::error($message, 401);
    }

    /**
     * Send forbidden response
     */
    public static function forbidden($message = 'Access forbidden') {
        self::error($message, 403);
    }

    /**
     * Send not found response
     */
    public static function notFound($message = 'Resource not found') {
        self::error($message, 404);
    }

    /**
     * Send method not allowed response
     */
    public static function methodNotAllowed($message = 'Method not allowed') {
        self::error($message, 405);
    }

    /**
     * Send internal server error response
     */
    public static function serverError($message = 'Internal server error') {
        self::error($message, 500);
    }

    /**
     * Send paginated response
     */
    public static function paginated($data, $total, $page, $pageSize, $message = 'Success') {
        $totalPages = ceil($total / $pageSize);
        
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => [
                'current_page' => (int) $page,
                'per_page' => (int) $pageSize,
                'total_items' => (int) $total,
                'total_pages' => (int) $totalPages,
                'has_next_page' => $page < $totalPages,
                'has_prev_page' => $page > 1
            ],
            'timestamp' => date('c')
        ];
        
        self::json($response, 200);
    }

    /**
     * Send created response
     */
    public static function created($data = null, $message = 'Resource created successfully') {
        self::success($data, $message, 201);
    }

    /**
     * Send updated response
     */
    public static function updated($data = null, $message = 'Resource updated successfully') {
        self::success($data, $message, 200);
    }

    /**
     * Send deleted response
     */
    public static function deleted($message = 'Resource deleted successfully') {
        self::success(null, $message, 200);
    }

    /**
     * Send no content response
     */
    public static function noContent() {
        http_response_code(204);
        exit();
    }
}