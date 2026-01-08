<?php
// Simple test of calendar API logic
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Mock the required classes and functions
class ResponseHelper {
    public static function json($data, $code = 200, $headers = []) {
        http_response_code($code);
        foreach ($headers as $key => $value) {
            header("$key: $value");
        }
        echo json_encode($data, JSON_PRETTY_PRINT);
    }
    
    public static function serverError($message) {
        http_response_code(500);
        echo json_encode(['error' => true, 'message' => $message]);
    }
}

class MockDatabase {
    // Mock database
}

class BaseController {
    protected $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    protected function logActivity($action, $data) {
        error_log("Activity: $action - " . json_encode($data));
    }
}

// Include our calendar controller (remove the <?php tag first)
$calendarCode = file_get_contents('/Users/timothy/data/franzkecreative/development/360gym/360-ng/api/controllers/CalendarController.php');
$calendarCode = str_replace('<?php', '', $calendarCode);
eval($calendarCode);

// Test the controller
$_GET = ['month' => '12', 'year' => '2025'];
$db = new MockDatabase();
$controller = new CalendarController($db);

echo "Testing Calendar API:\n";
echo "===================\n\n";

try {
    $controller->index();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>