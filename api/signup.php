<?php
require_once 'config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log function
function logError($message) {
    error_log(date('Y-m-d H:i:s') . " - " . $message . "\n", 3, __DIR__ . '/error.log');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    // Get JSON input
    $json = file_get_contents('php://input');
    logError("Received request data: " . $json);
    
    $data = json_decode($json);

    if (!$data) {
        logError("JSON decode error: " . json_last_error_msg());
        sendError('Invalid JSON data');
    }

    if (!isset($data->email) || !isset($data->password) || !isset($data->name)) {
        logError("Missing required fields");
        sendError('Missing required fields: name, email, and password are required');
    }

    $email = validateInput($data->email);
    $password = $data->password;
    $name = validateInput($data->name);

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format');
    }

    // Validate password strength
    if (strlen($password) < 6) {
        sendError('Password must be at least 6 characters long');
    }

    $conn = getDBConnection();
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendError('Email already exists');
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())");
    $result = $stmt->execute([$name, $email, $hashedPassword]);

    if (!$result) {
        logError("Database insert error: " . implode(", ", $stmt->errorInfo()));
        sendError('Failed to create user');
    }

    $userId = $conn->lastInsertId();

    // Generate token
    $token = generateToken($userId);

    sendResponse([
        'success' => true,
        'message' => 'Registration successful',
        'token' => $token,
        'user' => [
            'id' => $userId,
            'name' => $name,
            'email' => $email
        ]
    ]);

} catch(PDOException $e) {
    logError("Database error: " . $e->getMessage());
    sendError('Database error occurred', 500);
} catch(Exception $e) {
    logError("General error: " . $e->getMessage());
    sendError('An error occurred', 500);
}
?>
