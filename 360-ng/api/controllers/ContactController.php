<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class ContactController extends BaseController {
    
    public function __construct($database) {
        parent::__construct($database);
    }

    public function submit() {
        $rules = [
            'name' => ['required', 'maxLength' => 100],
            'email' => ['required', 'email'],
            'subject' => ['required', 'maxLength' => 200],
            'message' => ['required', 'maxLength' => 2000],
            'phone' => ['maxLength' => 20]
        ];

        $data = $this->validate($rules);
        if (!$data) {
            return;
        }

        try {
            $contactData = [
                'name' => trim($data['name']),
                'email' => trim($data['email']),
                'subject' => trim($data['subject']),
                'message' => trim($data['message']),
                'phone' => isset($data['phone']) ? trim($data['phone']) : null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
                'ip_address' => $this->getClientIP(),
                'submitted_at' => date('Y-m-d H:i:s')
            ];

            $this->saveContactSubmission($contactData);

            $emailSent = $this->sendContactEmail($contactData);

            if ($emailSent) {
                ResponseHelper::success([
                    'message' => 'Thank you for your message. We will get back to you soon!',
                    'submission_id' => $contactData['submitted_at']
                ], 'Contact form submitted successfully');
            } else {
                ResponseHelper::success([
                    'message' => 'Your message has been received but there was an issue sending the notification email.',
                    'submission_id' => $contactData['submitted_at']
                ], 'Contact form submitted with email warning');
            }

        } catch (Exception $e) {
            error_log("Contact form error: " . $e->getMessage());
            ResponseHelper::serverError('Sorry, there was an error processing your message. Please try again later.');
        }
    }

    public function getContacts() {
        try {
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 10;
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            $status = isset($_GET['status']) ? $_GET['status'] : '';
            
            $offset = ($page - 1) * $limit;
            
            $whereConditions = [];
            $params = [];
            
            if (!empty($search)) {
                $whereConditions[] = "(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)";
                $searchTerm = "%$search%";
                $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
            }
            
            if (!empty($status) && in_array($status, ['new', 'read', 'responded'])) {
                $whereConditions[] = "status = ?";
                $params[] = $status;
            }
            
            $whereClause = empty($whereConditions) ? '' : 'WHERE ' . implode(' AND ', $whereConditions);
            
            // Get total count
            $countSql = "SELECT COUNT(*) FROM contact_submissions $whereClause";
            $countStmt = $this->db->execute($countSql, $params);
            $totalItems = $countStmt->fetchColumn();
            
            // Get paginated data
            $sql = "SELECT * FROM contact_submissions $whereClause ORDER BY submitted_at DESC LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            
            $contactsStmt = $this->db->execute($sql, $params);
            $contacts = $contactsStmt->fetchAll();
            
            ResponseHelper::paginated(
                $contacts,
                $totalItems,
                $page,
                $limit,
                'Contacts retrieved successfully'
            );
            
        } catch (Exception $e) {
            error_log("Get contacts error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve contacts');
        }
    }

    public function getContact($id) {
        try {
            if (empty($id) || !is_numeric($id)) {
                ResponseHelper::badRequest('Invalid contact ID');
                return;
            }
            
            $sql = "SELECT * FROM contact_submissions WHERE id = ?";
            $stmt = $this->db->execute($sql, [$id]);
            $result = $stmt->fetchAll();
            
            if (empty($result)) {
                ResponseHelper::notFound('Contact not found');
                return;
            }
            
            ResponseHelper::success($result[0], 'Contact retrieved successfully');
            
        } catch (Exception $e) {
            error_log("Get contact error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve contact');
        }
    }

    public function updateContact($id) {
        try {
            if (empty($id) || !is_numeric($id)) {
                ResponseHelper::badRequest('Invalid contact ID');
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['status']) || !in_array($input['status'], ['new', 'read', 'responded'])) {
                ResponseHelper::badRequest('Valid status is required (new, read, responded)');
                return;
            }
            
            // Check if contact exists
            $checkSql = "SELECT id FROM contact_submissions WHERE id = ?";
            $stmt = $this->db->execute($checkSql, [$id]);
            $exists = $stmt->fetchAll();
            
            if (empty($exists)) {
                ResponseHelper::notFound('Contact not found');
                return;
            }
            
            $sql = "UPDATE contact_submissions SET status = ?, updated_at = NOW() WHERE id = ?";
            $this->db->execute($sql, [$input['status'], $id]);
            
            ResponseHelper::success(['id' => $id, 'status' => $input['status']], 'Contact status updated successfully');
            
        } catch (Exception $e) {
            error_log("Update contact error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to update contact');
        }
    }

    public function deleteContact($id) {
        try {
            if (empty($id) || !is_numeric($id)) {
                ResponseHelper::badRequest('Invalid contact ID');
                return;
            }
            
            // Check if contact exists
            $checkSql = "SELECT id FROM contact_submissions WHERE id = ?";
            $stmt = $this->db->execute($checkSql, [$id]);
            $exists = $stmt->fetchAll();
            
            if (empty($exists)) {
                ResponseHelper::notFound('Contact not found');
                return;
            }
            
            $sql = "DELETE FROM contact_submissions WHERE id = ?";
            $this->db->execute($sql, [$id]);
            
            ResponseHelper::success(['id' => $id], 'Contact deleted successfully');
            
        } catch (Exception $e) {
            error_log("Delete contact error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to delete contact');
        }
    }

    public function getNewCount() {
        try {
            $sql = "SELECT COUNT(*) FROM contact_submissions WHERE status = 'new'";
            $stmt = $this->db->execute($sql);
            $count = $stmt->fetchColumn();
            
            ResponseHelper::success(['count' => intval($count)], 'New contacts count retrieved successfully');
            
        } catch (Exception $e) {
            error_log("Get new contacts count error: " . $e->getMessage());
            ResponseHelper::serverError('Failed to retrieve new contacts count');
        }
    }

    private function saveContactSubmission($data) {
        $sql = "INSERT INTO contact_submissions (name, email, subject, message, phone, user_agent, ip_address, submitted_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        try {
            $this->db->execute($sql, [
                $data['name'],
                $data['email'],
                $data['subject'],
                $data['message'],
                $data['phone'],
                $data['user_agent'],
                $data['ip_address'],
                $data['submitted_at']
            ]);
        } catch (Exception $e) {
            error_log("Failed to save contact submission: " . $e->getMessage());
        }
    }

    private function sendContactEmail($data) {
        require_once __DIR__ . '/../vendor/autoload.php';
        $mail = new PHPMailer(true);

        try {
            // Configure server settings - use local mail function
            $mail->isMail();
            $mail->SMTPDebug = 0;

            // Set recipients
            $mail->setFrom('noreply@kc360gym.com', '360 Gym Contact Form');
            $mail->addAddress('360birthday@gmail.com ', '360 Gymnastics');
            $mail->addReplyTo($data['email'], $data['name']);

            // Configure email content
            $mail->isHTML(true);
            $mail->Subject = '[360 Gym Contact] ' . $data['subject'];
            
            // HTML body
            $mail->Body = "
                <h3>New contact form submission from 360 Gym website</h3>
                <p><strong>Name:</strong> " . htmlspecialchars($data['name']) . "</p>
                <p><strong>Email:</strong> " . htmlspecialchars($data['email']) . "</p>";
            
            if ($data['phone']) {
                $mail->Body .= "<p><strong>Phone:</strong> " . htmlspecialchars($data['phone']) . "</p>";
            }
            
            $mail->Body .= "
                <p><strong>Subject:</strong> " . htmlspecialchars($data['subject']) . "</p>
                <p><strong>Message:</strong></p>
                <p>" . nl2br(htmlspecialchars($data['message'])) . "</p>
                <hr>
                <p><small>
                    <strong>Submitted:</strong> " . $data['submitted_at'] . "<br>
                    <strong>IP Address:</strong> " . $data['ip_address'] . "<br>
                    <strong>User Agent:</strong> " . htmlspecialchars($data['user_agent']) . "
                </small></p>";

            // Alternative body for non-HTML clients
            $altBody = "New contact form submission from 360 Gym website:\n\n";
            $altBody .= "Name: " . $data['name'] . "\n";
            $altBody .= "Email: " . $data['email'] . "\n";
            if ($data['phone']) {
                $altBody .= "Phone: " . $data['phone'] . "\n";
            }
            $altBody .= "Subject: " . $data['subject'] . "\n\n";
            $altBody .= "Message:\n" . $data['message'] . "\n\n";
            $altBody .= "---\n";
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
}