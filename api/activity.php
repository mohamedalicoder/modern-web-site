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
    
    // Get recent activities (last 10)
    $stmt = $conn->prepare("
        (SELECT 'order' as type, 'New Order' as title, 
                CONCAT('Order #', id, ' placed') as description, 
                created_at as timestamp
         FROM orders 
         WHERE user_id = ?)
        UNION
        (SELECT 'review' as type, 'Product Review' as title,
                CONCAT('You reviewed ', p.name) as description,
                r.created_at as timestamp
         FROM reviews r
         JOIN products p ON r.product_id = p.id
         WHERE r.user_id = ?)
        UNION
        (SELECT 'wishlist' as type, 'Wishlist Update' as title,
                CONCAT('Added ', p.name, ' to wishlist') as description,
                w.created_at as timestamp
         FROM wishlist w
         JOIN products p ON w.product_id = p.id
         WHERE w.user_id = ?)
        ORDER BY timestamp DESC
        LIMIT 10
    ");
    
    $stmt->execute([$userId, $userId, $userId]);
    $activities = $stmt->fetchAll();

    sendResponse([
        'success' => true,
        'activities' => $activities
    ]);

} catch(PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
