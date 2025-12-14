<?php
// Import PHPMailer classes, load Composer autoloader, and create a PHPMailer instance
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'vendor/autoload.php';
$mail = new PHPMailer(true);

try {
    // --- ⚠️ KEY CHANGE ⚠️ ---
    // Use the local mail function (sendmail) instead of SMTP
    $mail->isMail(); 
    // $mail->isSMTP(); // REMOVE OR COMMENT OUT THIS LINE

    // --- ⚠️ OPTIONAL: REMOVE SMTP SETTINGS ⚠️ ---
    // These settings are now unnecessary as we are not using SMTP
    $mail->SMTPDebug = 0; // Set to 0 to turn off debugging
    // $mail->Host = 'localhost'; // Remove
    // $mail->SMTPAuth = false; // Remove
    // $mail->SMTPSecure = false; // Remove
    // $mail->Port = 25; // Remove

    // Set recipients (from, addAddress, addReplyTo)
    // IMPORTANT: The 'from' address must often be an email address that exists on your cPanel account for delivery to work reliably.
    $mail->setFrom('noreply@kc360gym.com', 'Mailer');
    $mail->addAddress('timothyfranzke@gmail.net', 'Joe User');

    // Configure email content (HTML format, subject, body, alternative body)
    $mail->isHTML(true);
    $mail->Subject = 'Here is the subject';
    $mail->Body = 'This is the HTML message body <b>in bold!</b>';
    $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

    // Send the email and output a success message
    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    // Catch exceptions and output an error message
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
?>