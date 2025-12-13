<?php
// Import PHPMailer classes, load Composer autoloader, and create a PHPMailer instance
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
require 'vendor/autoload.php';
$mail = new PHPMailer(true);

try {
    // Configure server settings (debug, SMTP, host, auth, username, password, security, port)
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->Host = 'franzketechnologies.com';
    $mail->SMTPAuth = false;
    // $mail->Username = 'noreply@franzketechnologies.com';
    // $mail->Password = 'XJt=l{wTT^WgAn&$';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;

    // Set recipients (from, addAddress, addReplyTo)
    $mail->setFrom('noreply@franzketechnologies.com', 'Mailer');
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
