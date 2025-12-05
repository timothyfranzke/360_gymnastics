<?php

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
        $to = 'timothyfranzke@gmail.com';
        $subject = '[360 Gym Contact] ' . $data['subject'];
        
        $message = "New contact form submission from 360 Gym website:\n\n";
        $message .= "Name: " . $data['name'] . "\n";
        $message .= "Email: " . $data['email'] . "\n";
        if ($data['phone']) {
            $message .= "Phone: " . $data['phone'] . "\n";
        }
        $message .= "Subject: " . $data['subject'] . "\n\n";
        $message .= "Message:\n" . $data['message'] . "\n\n";
        $message .= "---\n";
        $message .= "Submitted: " . $data['submitted_at'] . "\n";
        $message .= "IP Address: " . $data['ip_address'] . "\n";
        $message .= "User Agent: " . $data['user_agent'] . "\n";

        $headers = "From: noreply@360gym.com\r\n";
        $headers .= "Reply-To: " . $data['email'] . "\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $headers .= "X-Mailer: 360 Gym Contact Form\r\n";

        return mail($to, $subject, $message, $headers);
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