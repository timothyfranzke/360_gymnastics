<?php
/**
 * Global Error Handler
 * Handles PHP errors and exceptions for the API
 */

class ErrorHandler {
    
    /**
     * Set up error and exception handlers
     */
    public static function register() {
        // Set error handler for non-fatal errors
        set_error_handler([self::class, 'handleError']);
        
        // Set exception handler for uncaught exceptions
        set_exception_handler([self::class, 'handleException']);
        
        // Register shutdown function to catch fatal errors
        register_shutdown_function([self::class, 'handleShutdown']);
    }

    /**
     * Handle PHP errors
     */
    public static function handleError($severity, $message, $filename, $lineno) {
        // Only handle errors that are included in error_reporting
        if (!(error_reporting() & $severity)) {
            return;
        }

        $errorType = self::getErrorType($severity);
        
        $errorDetails = [
            'type' => $errorType,
            'message' => $message,
            'file' => $filename,
            'line' => $lineno,
            'timestamp' => date('c')
        ];

        // Log the error
        self::logError($errorDetails);

        // In development, show detailed errors
        if (ENV === 'development') {
            ResponseHelper::serverError('PHP Error: ' . $message, 500, null, $errorDetails);
        } else {
            ResponseHelper::serverError('An internal error occurred');
        }
    }

    /**
     * Handle uncaught exceptions
     */
    public static function handleException($exception) {
        $errorDetails = [
            'type' => 'Exception',
            'class' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'timestamp' => date('c')
        ];

        // Log the exception
        self::logError($errorDetails);

        // In development, show detailed errors
        if (ENV === 'development') {
            ResponseHelper::serverError(
                'Uncaught Exception: ' . $exception->getMessage(),
                500,
                null,
                $errorDetails
            );
        } else {
            ResponseHelper::serverError('An internal error occurred');
        }
    }

    /**
     * Handle fatal errors during shutdown
     */
    public static function handleShutdown() {
        $error = error_get_last();
        
        if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
            $errorDetails = [
                'type' => self::getErrorType($error['type']),
                'message' => $error['message'],
                'file' => $error['file'],
                'line' => $error['line'],
                'timestamp' => date('c')
            ];

            // Log the fatal error
            self::logError($errorDetails);

            // Clean any output buffer
            if (ob_get_level()) {
                ob_clean();
            }

            // Send error response
            http_response_code(500);
            header('Content-Type: application/json');
            
            if (ENV === 'development') {
                echo json_encode([
                    'success' => false,
                    'error' => true,
                    'message' => 'Fatal Error: ' . $error['message'],
                    'details' => $errorDetails,
                    'timestamp' => date('c')
                ], JSON_PRETTY_PRINT);
            } else {
                echo json_encode([
                    'success' => false,
                    'error' => true,
                    'message' => 'A fatal error occurred',
                    'timestamp' => date('c')
                ], JSON_PRETTY_PRINT);
            }
        }
    }

    /**
     * Log error to file and/or external service
     */
    private static function logError($errorDetails) {
        $logMessage = sprintf(
            "[%s] %s: %s in %s on line %d",
            $errorDetails['timestamp'],
            $errorDetails['type'],
            $errorDetails['message'],
            $errorDetails['file'],
            $errorDetails['line']
        );

        // Log to PHP error log
        error_log($logMessage);

        // Create logs directory if it doesn't exist
        $logsDir = __DIR__ . '/../logs';
        if (!is_dir($logsDir)) {
            mkdir($logsDir, 0755, true);
        }

        // Log to custom API error log
        $logFile = $logsDir . '/api_errors.log';
        $detailedLog = json_encode($errorDetails) . "\n";
        file_put_contents($logFile, $detailedLog, FILE_APPEND | LOCK_EX);

        // In production, you might want to send to external logging service
        if (ENV === 'production') {
            // Example: Send to external logging service
            // self::sendToExternalLoggingService($errorDetails);
        }
    }

    /**
     * Get human-readable error type
     */
    private static function getErrorType($severity) {
        $errorTypes = [
            E_ERROR => 'Fatal Error',
            E_WARNING => 'Warning',
            E_PARSE => 'Parse Error',
            E_NOTICE => 'Notice',
            E_CORE_ERROR => 'Core Error',
            E_CORE_WARNING => 'Core Warning',
            E_COMPILE_ERROR => 'Compile Error',
            E_COMPILE_WARNING => 'Compile Warning',
            E_USER_ERROR => 'User Error',
            E_USER_WARNING => 'User Warning',
            E_USER_NOTICE => 'User Notice',
            E_STRICT => 'Strict Standards',
            E_RECOVERABLE_ERROR => 'Recoverable Error',
            E_DEPRECATED => 'Deprecated',
            E_USER_DEPRECATED => 'User Deprecated'
        ];

        return $errorTypes[$severity] ?? 'Unknown Error';
    }

    /**
     * Custom database error handler
     */
    public static function handleDatabaseError($error, $query = null, $params = null) {
        $errorDetails = [
            'type' => 'Database Error',
            'message' => $error,
            'query' => $query,
            'params' => $params,
            'timestamp' => date('c')
        ];

        self::logError($errorDetails);

        if (ENV === 'development') {
            ResponseHelper::serverError('Database Error: ' . $error, 500, null, $errorDetails);
        } else {
            ResponseHelper::serverError('A database error occurred');
        }
    }

    /**
     * Handle validation errors
     */
    public static function handleValidationError($errors, $message = 'Validation failed') {
        ResponseHelper::validationError($errors, $message);
    }

    /**
     * Handle authentication errors
     */
    public static function handleAuthError($message = 'Authentication failed') {
        ResponseHelper::unauthorized($message);
    }

    /**
     * Handle authorization errors
     */
    public static function handleAuthorizationError($message = 'Access denied') {
        ResponseHelper::forbidden($message);
    }

    /**
     * Send to external logging service (placeholder)
     */
    private static function sendToExternalLoggingService($errorDetails) {
        // Example implementation for external logging service
        // This could be Sentry, LogRocket, or any other service
        
        // $payload = json_encode($errorDetails);
        // $ch = curl_init();
        // curl_setopt($ch, CURLOPT_URL, 'https://your-logging-service.com/api/errors');
        // curl_setopt($ch, CURLOPT_POST, 1);
        // curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        // curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // curl_exec($ch);
        // curl_close($ch);
    }

    /**
     * Get error logs
     */
    public static function getErrorLogs($limit = 100) {
        $logFile = __DIR__ . '/../logs/api_errors.log';
        
        if (!file_exists($logFile)) {
            return [];
        }

        $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $logs = [];
        
        // Get the last N lines
        $recentLines = array_slice($lines, -$limit);
        
        foreach ($recentLines as $line) {
            $decoded = json_decode($line, true);
            if ($decoded) {
                $logs[] = $decoded;
            }
        }
        
        return array_reverse($logs); // Most recent first
    }

    /**
     * Clear error logs
     */
    public static function clearErrorLogs() {
        $logFile = __DIR__ . '/../logs/api_errors.log';
        
        if (file_exists($logFile)) {
            file_put_contents($logFile, '');
            return true;
        }
        
        return false;
    }
}