<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json);

if (!$data || !isset($data->name) || !isset($data->email) || !isset($data->subject) || !isset($data->message)) {
    sendError('Invalid input data');
}

$name = validateInput($data->name);
$email = validateInput($data->email);
$subject = validateInput($data->subject);
$message = validateInput($data->message);

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Invalid email format');
}

try {
    $conn = getDBConnection();
    
    // Insert message into database
    $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$name, $email, $subject, $message]);

    // Send email notification (implement your email sending logic here)
    $emailSent = sendEmailNotification($name, $email, $subject, $message);

    sendResponse([
        'success' => true,
        'message' => 'Message sent successfully'
    ]);

} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}

// Email notification function (implement your own email sending logic)
function sendEmailNotification($name, $email, $subject, $message) {
    $to = 'admin@webapp.com';
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    $emailBody = "
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Subject:</strong> $subject</p>
        <p><strong>Message:</strong></p>
        <p>$message</p>
    ";

    return mail($to, "Contact Form: $subject", $emailBody, $headers);
}
?>
