<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json);

if (!$data || !isset($data->email) || !isset($data->password)) {
    sendError('Invalid input data');
}

$email = validateInput($data->email);
$password = $data->password;
$rememberMe = isset($data->rememberMe) ? $data->rememberMe : false;

try {
    $conn = getDBConnection();
    
    // Get user from database
    $stmt = $conn->prepare("SELECT id, password, name, email FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        sendError('Invalid email or password', 401);
    }

    // Generate token
    $token = generateToken($user['id']);

    // Remove password from user data
    unset($user['password']);

    sendResponse([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => $user
    ]);

} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
