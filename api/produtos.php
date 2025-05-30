<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '/';

if ($method === 'GET') {
    if($path === '/myproducts') {
        $userId = $_SESSION['user']['id'];
        $result = $conn->query("SELECT * FROM products WHERE user_id='$userId'");
        $produtos = [];
        while ($row = $result->fetch_assoc()) {
            $produtos[] = $row;
        }
        echo json_encode($produtos);
        exit;
    }

    $result = $conn->query("SELECT * FROM products");
    $produtos = [];
    while ($row = $result->fetch_assoc()) {
        $produtos[] = $row;
    }
    echo json_encode($produtos);
    exit; 
}



if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nome = $conn->real_escape_string($data['name']);
    $imagem = $conn->real_escape_string($data['image']);
    $categoria = intval($data['category_id']);
    $userId = intval($_SESSION['user']['id']);
    error_log("Valor de categoria: " . print_r($categoria, true));
    error_log("Dados recebidos: " . print_r($data, true));
    $conn->query("INSERT INTO products (name, image, user_id, category_id ) VALUES ('$nome', '$imagem', '$userId', $categoria)");
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);
}

if ($method === 'DELETE') {
    parse_str(file_get_contents("php://input"), $data);
    $id = intval($data['id']);
    $conn->query("DELETE FROM products WHERE id=$id");
    echo json_encode(['success' => true, 'message' => 'produto foi deletado', 'id' => $id]);
}
?>