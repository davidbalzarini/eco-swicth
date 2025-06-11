<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM product_conditions ORDER BY id");
    $conditions = [];
    while ($row = $result->fetch_assoc()) {
        $conditions[] = $row;
    }
    echo json_encode($conditions);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Método não permitido']);
?>