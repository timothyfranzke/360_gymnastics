<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class PartyController extends BaseController {
    
    public function __construct($database) {
        parent::__construct($database);
    }

    public function submit() {
        $rules = [
            'parentName' => ['required', 'maxLength' => 100],
            'phone' => ['required', 'maxLength' => 20],
            'canText' => ['required'],
            'email' => ['required', 'email'],
            'city' => ['required', 'maxLength' => 100],
            'partyType' => ['required', 'maxLength' => 50],
            'requestedDate' => ['required', 'date'],
            'requestedTime' => ['required'],
            'childName' => ['required', 'maxLength' => 100],
            'childAge' => ['required', 'integer', 'min' => 1, 'max' => 18],
            'estimatedChildren' => ['required', 'integer', 'min' => 1, 'max' => 50],
            'additionalDetails' => ['maxLength' => 2000]
        ];

        $data = $this->validate($rules);
        if (!$data) {
            return;
        }

        try {
            // Validate phone number format
            if (!$this->validatePhoneNumber($data['phone'])) {
                ResponseHelper::error('Please enter a valid phone number', 400);
                return;
            }

            // Validate canText value
            if (!in_array($data['canText'], ['yes', 'no'])) {
                ResponseHelper::error('Invalid text permission value', 400);
                return;
            }

            // Validate requested date is not in the past
            $requestedDate = new DateTime($data['requestedDate']);
            $today = new DateTime();
            $today->setTime(0, 0, 0);
            
            if ($requestedDate < $today) {
                ResponseHelper::error('Requested date cannot be in the past', 400);
                return;
            }

            // Validate requested time format
            if (!$this->validateTimeFormat($data['requestedTime'])) {
                ResponseHelper::error('Please enter a valid time', 400);
                return;
            }

            $partyData = [
                'parent_name' => trim($data['parentName']),
                'phone' => trim($data['phone']),
                'can_text' => $data['canText'],
                'email' => trim($data['email']),
                'city' => trim($data['city']),
                'party_type' => trim($data['partyType']),
                'requested_date' => $data['requestedDate'],
                'requested_time' => $data['requestedTime'],
                'child_name' => trim($data['childName']),
                'child_age' => (int)$data['childAge'],
                'estimated_children' => (int)$data['estimatedChildren'],
                'additional_details' => isset($data['additionalDetails']) ? trim($data['additionalDetails']) : null,
                'status' => 'pending',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
                'ip_address' => $this->getClientIP(),
                'submitted_at' => date('Y-m-d H:i:s')
            ];

            $partyId = $this->savePartyRequest($partyData);
            $partyData['id'] = $partyId;

            $emailSent = $this->sendPartyEmail($partyData);

            if ($emailSent) {
                ResponseHelper::success([
                    'message' => 'Thank you for your party request! We will contact you within 24 hours to discuss details and availability.',
                    'party_id' => $partyId
                ], 'Party request submitted successfully');
            } else {
                ResponseHelper::success([
                    'message' => 'Your party request has been received but there was an issue sending the notification email.',
                    'party_id' => $partyId
                ], 'Party request submitted with email warning');
            }

        } catch (Exception $e) {
            error_log("Party request error: " . $e->getMessage());
            ResponseHelper::serverError('Sorry, there was an error processing your party request. Please try again later.');
        }
    }

    public function index() {
        try {
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
            $status = $_GET['status'] ?? null;
            $search = $_GET['search'] ?? null;
            $partyType = $_GET['party_type'] ?? null;
            $dateFrom = $_GET['date_from'] ?? null;
            $dateTo = $_GET['date_to'] ?? null;
            
            $offset = ($page - 1) * $limit;
            
            $whereConditions = [];
            $params = [];
            
            if ($status && in_array($status, ['pending', 'contacted', 'confirmed', 'cancelled'])) {
                $whereConditions[] = 'status = ?';
                $params[] = $status;
            }
            
            if ($search) {
                $whereConditions[] = '(parent_name LIKE ? OR email LIKE ? OR child_name LIKE ? OR phone LIKE ?)';
                $searchTerm = '%' . $search . '%';
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }
            
            if ($partyType) {
                $whereConditions[] = 'party_type LIKE ?';
                $params[] = '%' . $partyType . '%';
            }
            
            if ($dateFrom) {
                $whereConditions[] = 'requested_date >= ?';
                $params[] = $dateFrom;
            }
            
            if ($dateTo) {
                $whereConditions[] = 'requested_date <= ?';
                $params[] = $dateTo;
            }
            
            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            $sql = "SELECT * FROM party_requests {$whereClause} ORDER BY submitted_at DESC LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->db->execute($sql, $params);
            $parties = $stmt->fetchAll();
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM party_requests {$whereClause}";
            $countParams = array_slice($params, 0, -2); // Remove limit and offset
            $countStmt = $this->db->execute($countSql, $countParams);
            $total = $countStmt->fetch()['total'];
            
            ResponseHelper::paginated(
                $parties,
                $total,
                $page,
                $limit,
                'Party requests retrieved successfully'
            );
            
        } catch (Exception $e) {
            error_log("Error fetching parties: " . $e->getMessage());
            ResponseHelper::serverError('Error fetching party requests');
        }
    }

    public function show($id) {
        try {
            $sql = "SELECT * FROM party_requests WHERE id = ?";
            $stmt = $this->db->execute($sql, [$id]);
            $party = $stmt->fetch();
            
            if (!$party) {
                ResponseHelper::notFound('Party request not found');
                return;
            }
            
            ResponseHelper::success($party);
            
        } catch (Exception $e) {
            error_log("Error fetching party: " . $e->getMessage());
            ResponseHelper::serverError('Error fetching party request');
        }
    }

    public function updateStatus($id) {
        $rules = [
            'status' => ['required']
        ];

        $data = $this->validate($rules);
        if (!$data) {
            return;
        }

        if (!in_array($data['status'], ['pending', 'contacted', 'confirmed', 'cancelled'])) {
            ResponseHelper::error('Invalid status value', 400);
            return;
        }

        try {
            $sql = "UPDATE party_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            $stmt = $this->db->execute($sql, [$data['status'], $id]);
            
            if ($stmt->rowCount() === 0) {
                ResponseHelper::notFound('Party request not found');
                return;
            }
            
            ResponseHelper::success(['message' => 'Party request status updated successfully']);
            
        } catch (Exception $e) {
            error_log("Error updating party status: " . $e->getMessage());
            ResponseHelper::serverError('Error updating party request status');
        }
    }

    public function delete($id) {
        try {
            $sql = "DELETE FROM party_requests WHERE id = ?";
            $stmt = $this->db->execute($sql, [$id]);
            
            if ($stmt->rowCount() === 0) {
                ResponseHelper::notFound('Party request not found');
                return;
            }
            
            ResponseHelper::success(['message' => 'Party request deleted successfully']);
            
        } catch (Exception $e) {
            error_log("Error deleting party: " . $e->getMessage());
            ResponseHelper::serverError('Error deleting party request');
        }
    }

    public function stats() {
        try {
            $sql = "SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
                        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                        SUM(CASE WHEN DATE(submitted_at) = CURDATE() THEN 1 ELSE 0 END) as today,
                        SUM(CASE WHEN submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as this_week,
                        SUM(CASE WHEN submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as this_month
                    FROM party_requests";
            
            $stmt = $this->db->execute($sql);
            $stats = $stmt->fetch();
            
            ResponseHelper::success($stats);
            
        } catch (Exception $e) {
            error_log("Error fetching party stats: " . $e->getMessage());
            ResponseHelper::serverError('Error fetching party statistics');
        }
    }

    private function savePartyRequest($data) {
        $sql = "INSERT INTO party_requests (
                    parent_name, phone, can_text, email, city, party_type, 
                    requested_date, requested_time, child_name, child_age, 
                    estimated_children, additional_details, status, 
                    user_agent, ip_address, submitted_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try {
            $this->db->execute($sql, [
                $data['parent_name'],
                $data['phone'],
                $data['can_text'],
                $data['email'],
                $data['city'],
                $data['party_type'],
                $data['requested_date'],
                $data['requested_time'],
                $data['child_name'],
                $data['child_age'],
                $data['estimated_children'],
                $data['additional_details'],
                $data['status'],
                $data['user_agent'],
                $data['ip_address'],
                $data['submitted_at']
            ]);
            
            return $this->db->lastInsertId();
            
        } catch (Exception $e) {
            error_log("Failed to save party request: " . $e->getMessage());
            throw $e;
        }
    }

    private function sendPartyEmail($data) {
        require_once __DIR__ . '/../vendor/autoload.php';
        $mail = new PHPMailer(true);

        try {
            // Configure server settings - use local mail function
            $mail->isMail();
            $mail->SMTPDebug = 0;

            // Set recipients
            $mail->setFrom('noreply@kc360gym.com', '360 Gym Party Request Form');
            $mail->addAddress('360birthday@gmail.com', '360 Gymnastics');
            $mail->addReplyTo($data['email'], $data['parent_name']);

            // Configure email content
            $mail->isHTML(true);
            $mail->Subject = '[360 Gym Party Request] ' . $data['child_name'] . "'s Birthday Party";
            
            // HTML body
            $mail->Body = "
                <h3>New birthday party request from 360 Gym website</h3>
                
                <h4>PARENT INFORMATION:</h4>
                <p><strong>Name:</strong> " . htmlspecialchars($data['parent_name']) . "</p>
                <p><strong>Email:</strong> " . htmlspecialchars($data['email']) . "</p>
                <p><strong>Phone:</strong> " . htmlspecialchars($data['phone']) . "</p>
                <p><strong>Can text:</strong> " . ucfirst(htmlspecialchars($data['can_text'])) . "</p>
                <p><strong>City:</strong> " . htmlspecialchars($data['city']) . "</p>
                
                <h4>PARTY DETAILS:</h4>
                <p><strong>Child's Name:</strong> " . htmlspecialchars($data['child_name']) . "</p>
                <p><strong>Child's Age:</strong> " . $data['child_age'] . "</p>
                <p><strong>Party Type:</strong> " . htmlspecialchars($data['party_type']) . "</p>
                <p><strong>Requested Date:</strong> " . date('F j, Y', strtotime($data['requested_date'])) . "</p>
                <p><strong>Requested Time:</strong> " . date('g:i A', strtotime($data['requested_time'])) . "</p>
                <p><strong>Estimated Children:</strong> " . $data['estimated_children'] . "</p>";
            
            if ($data['additional_details']) {
                $mail->Body .= "<h4>ADDITIONAL DETAILS:</h4><p>" . nl2br(htmlspecialchars($data['additional_details'])) . "</p>";
            }
            
            $mail->Body .= "
                <hr>
                <p><small>
                    <strong>Request ID:</strong> " . $data['id'] . "<br>
                    <strong>Submitted:</strong> " . $data['submitted_at'] . "<br>
                    <strong>IP Address:</strong> " . $data['ip_address'] . "<br>
                    <strong>User Agent:</strong> " . htmlspecialchars($data['user_agent']) . "
                </small></p>";

            // Alternative body for non-HTML clients
            $altBody = "New birthday party request from 360 Gym website:\n\n";
            $altBody .= "PARENT INFORMATION:\n";
            $altBody .= "Name: " . $data['parent_name'] . "\n";
            $altBody .= "Email: " . $data['email'] . "\n";
            $altBody .= "Phone: " . $data['phone'] . "\n";
            $altBody .= "Can text: " . ucfirst($data['can_text']) . "\n";
            $altBody .= "City: " . $data['city'] . "\n\n";
            $altBody .= "PARTY DETAILS:\n";
            $altBody .= "Child's Name: " . $data['child_name'] . "\n";
            $altBody .= "Child's Age: " . $data['child_age'] . "\n";
            $altBody .= "Party Type: " . $data['party_type'] . "\n";
            $altBody .= "Requested Date: " . date('F j, Y', strtotime($data['requested_date'])) . "\n";
            $altBody .= "Requested Time: " . date('g:i A', strtotime($data['requested_time'])) . "\n";
            $altBody .= "Estimated Children: " . $data['estimated_children'] . "\n\n";
            
            if ($data['additional_details']) {
                $altBody .= "ADDITIONAL DETAILS:\n" . $data['additional_details'] . "\n\n";
            }
            
            $altBody .= "---\n";
            $altBody .= "Request ID: " . $data['id'] . "\n";
            $altBody .= "Submitted: " . $data['submitted_at'] . "\n";
            $altBody .= "IP Address: " . $data['ip_address'] . "\n";
            $altBody .= "User Agent: " . $data['user_agent'] . "\n";
            
            $mail->AltBody = $altBody;

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("PHPMailer error: " . $mail->ErrorInfo);
            return false;
        }
    }

    private function validatePhoneNumber($phone) {
        return preg_match('/^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/', $phone);
    }

    private function validateTimeFormat($time) {
        return preg_match('/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/', $time) || 
               preg_match('/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/i', $time);
    }

    private function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ips = explode(',', $_SERVER[$key]);
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }

    public function getNewCount() {
        try {
            $sql = "SELECT COUNT(*) FROM party_requests WHERE status = 'pending'";
            $stmt = $this->db->execute($sql);
            $count = $stmt->fetchColumn();
            
            ResponseHelper::success(['count' => intval($count)], 'New party requests count retrieved successfully');
            
        } catch (Exception $e) {
            error_log("Get new party requests count error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve new party requests count');
        }
    }
}