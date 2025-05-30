<?php
header('Content-Type: application/json');
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if(isset($_GET['id'])){
        $id = intval($_GET['id']);
        $result = $conn->query("SELECT * FROM category WHERE id=$id");
        if ($result->num_rows > 0) {
            $produto = $result->fetch_assoc();
            echo json_encode($produto);
        } else {
            echo json_encode(['error' => 'Categoria não encontrado']);
        }
        exit;
    }




    $result = $conn->query("SELECT * FROM category");
    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }
    echo json_encode($categories);
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nome = $conn->real_escape_string($data['nome']);
    $imagem = $conn->real_escape_string($data['imagem']);
    $categoria = $conn->real_escape_string($data['categoria']);
    $conn->query("INSERT INTO produtos (nome, imagem, categoria) VALUES ('$nome', '$imagem', '$categoria')");
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);
}

if ($method === 'DELETE') {
    parse_str(file_get_contents("php://input"), $data);
    $id = intval($data['id']);
    $conn->query("DELETE FROM produtos WHERE id=$id");
    echo json_encode(['success' => true]);
}
?>