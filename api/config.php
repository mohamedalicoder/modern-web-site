<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '12345');  // Update this if your MySQL root user has a password
define('DB_NAME', 'webapp_db');

// API Configuration
define('JWT_SECRET', 'your-secret-key'); // Change this to a secure secret key
define('TOKEN_EXPIRY', 86400); // 24 hours in seconds

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Connection
function getDBConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            )
        );
        return $conn;
    } catch(PDOException $e) {
        sendError('Database connection failed: ' . $e->getMessage(), 500);
    }
}

// Response Helper Functions
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function sendError($message, $statusCode = 400) {
    sendResponse([
        'success' => false,
        'message' => $message
    ], $statusCode);
}

// Input Validation
function validateInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// JWT Helper Functions
function generateToken($userId) {
    $issuedAt = time();
    $expirationTime = $issuedAt + TOKEN_EXPIRY;

    $payload = [
        'iat' => $issuedAt,
        'exp' => $expirationTime,
        'userId' => $userId
    ];

    return jwt_encode($payload, JWT_SECRET);
}

function verifyToken($token) {
    try {
        $decoded = jwt_decode($token, JWT_SECRET);
        return $decoded->userId;
    } catch(Exception $e) {
        return false;
    }
}

// Simple JWT implementation (for demonstration - use a proper JWT library in production)
function jwt_encode($payload, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function jwt_decode($token, $secret) {
    $tokenParts = explode('.', $token);
    if (count($tokenParts) != 3) {
        throw new Exception('Invalid token format');
    }
    
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
    return json_decode($payload);
}
?>
