<?php
require_once 'config.php';

// Check if user is authenticated
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    sendError('Unauthorized', 401);
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$userId = verifyToken($token);

if (!$userId) {
    sendError('Invalid token', 401);
}

try {
    $conn = getDBConnection();
    
    // Get orders count
    $stmt = $conn->prepare("SELECT COUNT(*) as orders FROM orders WHERE user_id = ?");
    $stmt->execute([$userId]);
    $orders = $stmt->fetch()['orders'];

    // Get wishlist count
    $stmt = $conn->prepare("SELECT COUNT(*) as wishlist FROM wishlist WHERE user_id = ?");
    $stmt->execute([$userId]);
    $wishlist = $stmt->fetch()['wishlist'];

    // Get reviews count
    $stmt = $conn->prepare("SELECT COUNT(*) as reviews FROM reviews WHERE user_id = ?");
    $stmt->execute([$userId]);
    $reviews = $stmt->fetch()['reviews'];

    sendResponse([
        'success' => true,
        'statistics' => [
            'orders' => (int)$orders,
            'wishlist' => (int)$wishlist,
            'reviews' => (int)$reviews
        ]
    ]);

} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
