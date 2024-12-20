<?php
// Database connection details
require_once __DIR__ . '/../api/config.php';

try {
    // Create initial connection without database
    $conn = new PDO(
        "mysql:host=" . DB_HOST,
        DB_USER,
        DB_PASS,
        array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
    );
    
    // Create database if it doesn't exist
    $conn->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME);
    echo "Database created successfully\n";
    
    // Select the database
    $conn->exec("USE " . DB_NAME);
    
    // Read and execute SQL file
    $sql = file_get_contents(__DIR__ . '/schema.sql');
    $conn->exec($sql);
    
    echo "Database schema initialized successfully\n";
    
} catch(PDOException $e) {
    die("Error: " . $e->getMessage() . "\n");
}
?>
