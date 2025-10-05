<?php
/**
 * Input Validation Utility
 * Comprehensive validation and sanitization for API inputs
 */

class Validator {
    private $errors = [];
    private $data = [];

    public function __construct($data = []) {
        $this->data = $data;
        $this->errors = [];
    }

    /**
     * Validate required field
     */
    public function required($field, $message = null) {
        $message = $message ?: "$field is required";
        
        if (!isset($this->data[$field]) || empty(trim($this->data[$field]))) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Validate email format
     */
    public function email($field, $message = null) {
        $message = $message ?: "$field must be a valid email address";
        
        if (isset($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Validate minimum length
     */
    public function minLength($field, $length, $message = null) {
        $message = $message ?: "$field must be at least $length characters long";
        
        if (isset($this->data[$field]) && strlen($this->data[$field]) < $length) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Validate maximum length
     */
    public function maxLength($field, $length, $message = null) {
        $message = $message ?: "$field must not exceed $length characters";
        
        if (isset($this->data[$field]) && strlen($this->data[$field]) > $length) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Validate numeric value
     */
    public function numeric($field, $message = null) {
        $message = $message ?: "$field must be a number";
        
        if (isset($this->data[$field]) && !is_numeric($this->data[$field])) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Validate integer value
     */
    public function integer($field, $message = null) {
        $message = $message ?: "$field must be an integer";
        
        if (isset($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_INT)) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Validate minimum value
     */
    public function min($field, $min, $message = null) {
        $message = $message ?: "$field must be at least $min";
        
        if (isset($this->data[$field]) && $this->data[$field] < $min) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Validate maximum value
     */
    public function max($field, $max, $message = null) {
        $message = $message ?: "$field must not exceed $max";
        
        if (isset($this->data[$field]) && $this->data[$field] > $max) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Validate date format
     */
    public function date($field, $format = 'Y-m-d', $message = null) {
        $message = $message ?: "$field must be a valid date in format $format";
        
        if (isset($this->data[$field])) {
            $d = DateTime::createFromFormat($format, $this->data[$field]);
            if (!$d || $d->format($format) !== $this->data[$field]) {
                $this->errors[$field][] = $message;
            }
        }
        
        return $this;
    }

    /**
     * Validate time format
     */
    public function time($field, $format = 'H:i:s', $message = null) {
        $message = $message ?: "$field must be a valid time in format $format";
        
        if (isset($this->data[$field])) {
            $t = DateTime::createFromFormat($format, $this->data[$field]);
            if (!$t || $t->format($format) !== $this->data[$field]) {
                $this->errors[$field][] = $message;
            }
        }
        
        return $this;
    }

    /**
     * Validate value is in array of allowed values
     */
    public function in($field, $allowed, $message = null) {
        $allowedStr = implode(', ', $allowed);
        $message = $message ?: "$field must be one of: $allowedStr";
        
        if (isset($this->data[$field]) && !in_array($this->data[$field], $allowed, true)) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Validate regex pattern
     */
    public function regex($field, $pattern, $message = null) {
        $message = $message ?: "$field format is invalid";
        
        if (isset($this->data[$field]) && !preg_match($pattern, $this->data[$field])) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Validate boolean value
     */
    public function boolean($field, $message = null) {
        $message = $message ?: "$field must be true or false";
        
        if (isset($this->data[$field]) && !filter_var($this->data[$field], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) === null) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Custom validation function
     */
    public function custom($field, $callback, $message = null) {
        $message = $message ?: "$field is invalid";
        
        if (isset($this->data[$field]) && !call_user_func($callback, $this->data[$field])) {
            $this->errors[$field][] = $message;
        }
        
        return $this;
    }

    /**
     * Check if validation passed
     */
    public function isValid() {
        return empty($this->errors);
    }

    /**
     * Get validation errors
     */
    public function getErrors() {
        return $this->errors;
    }

    /**
     * Get first error for a field
     */
    public function getFirstError($field) {
        return isset($this->errors[$field]) ? $this->errors[$field][0] : null;
    }

    /**
     * Sanitize input data
     */
    public static function sanitize($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Sanitize email
     */
    public static function sanitizeEmail($email) {
        return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
    }

    /**
     * Sanitize URL
     */
    public static function sanitizeUrl($url) {
        return filter_var(trim($url), FILTER_SANITIZE_URL);
    }

    /**
     * Sanitize integer
     */
    public static function sanitizeInt($value) {
        return filter_var($value, FILTER_SANITIZE_NUMBER_INT);
    }

    /**
     * Sanitize float
     */
    public static function sanitizeFloat($value) {
        return filter_var($value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }
}