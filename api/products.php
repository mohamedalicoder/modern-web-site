<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $conn = getDBConnection();
        
        // Get all products
        $stmt = $conn->query("SELECT * FROM products ORDER BY created_at DESC");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse([
            'success' => true,
            'products' => $products
        ]);

    } catch(PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check authentication
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        sendError('Authentication required', 401);
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $userId = verifyToken($token);
    
    if (!$userId) {
        sendError('Invalid token', 401);
    }

    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json);

    if (!$data || !isset($data->name) || !isset($data->price)) {
        sendError('Invalid input data');
    }

    $name = validateInput($data->name);
    $description = isset($data->description) ? validateInput($data->description) : '';
    $price = floatval($data->price);
    $imageUrl = isset($data->image_url) ? validateInput($data->image_url) : '';

    try {
        $conn = getDBConnection();
        
        // Insert new product
        $stmt = $conn->prepare("INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $description, $price, $imageUrl]);

        $productId = $conn->lastInsertId();

        sendResponse([
            'success' => true,
            'message' => 'Product created successfully',
            'product' => [
                'id' => $productId,
                'name' => $name,
                'description' => $description,
                'price' => $price,
                'image_url' => $imageUrl
            ]
        ]);

    } catch(PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
} else {
    sendError('Method not allowed', 405);
}
?>
