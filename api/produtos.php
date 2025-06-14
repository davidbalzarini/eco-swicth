<?php
// eco switch/eco-swicth-main/api/produtos.php
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

    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $result = $conn->query("SELECT p.*, pc.name as condition_name, u.name as user_name 
                               FROM products p 
                               JOIN users u ON p.user_id = u.id 
                               LEFT JOIN product_conditions pc ON p.condition_id = pc.id 
                               WHERE p.id=$id");
        if ($result->num_rows > 0) {
            $produto = $result->fetch_assoc();
            echo json_encode($produto);
            exit;
        }
    }

    // $result = $conn->query("SELECT * FROM products");
    // $produtos = [];
    // while ($row = $result->fetch_assoc()) {
    //     $produtos[] = $row;
    // }
    // echo json_encode($produtos);
    // exit; 
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 12;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

    $result = $conn->query("SELECT SQL_CALC_FOUND_ROWS * FROM products LIMIT $limit OFFSET $offset");
    $produtos = [];
    while ($row = $result->fetch_assoc()) {
        $produtos[] = $row;
    }
    $totalResult = $conn->query("SELECT FOUND_ROWS() as total");
    $total = $totalResult->fetch_assoc()['total'];
    echo json_encode(['products' => $produtos, 'total' => $total]);
    exit; 
}



if ($method === 'POST' && isset($_POST['id'])) {
    $id = intval($_POST['id']);
    $nome = $conn->real_escape_string($_POST['name']);
    $categoria = intval($_POST['category_id']);
    $userId = $_SESSION['user']['id'];
    $conditionId = intval($_POST['condition_id']);
    $usageTime = $conn->real_escape_string($_POST['usage_time']);


    $stmt = $conn->prepare("UPDATE products SET name=?, category_id=?, condition_id=?, usage_time=? WHERE id=? AND user_id=?");
    $stmt->bind_param("siisii", $nome, $categoria, $conditionId, $usageTime, $id, $userId);
    $stmt->execute();

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $imageName = $id . '.' . strtolower($ext);
        $destPath = __DIR__ . "/../images/" . $imageName;
        move_uploaded_file($_FILES['image']['tmp_name'], $destPath);

        $imageUrl = "images/" . $imageName;
        $stmt = $conn->prepare("UPDATE products SET image=? WHERE id=?");
        $stmt->bind_param("si", $imageUrl, $id);
        $stmt->execute();
    }

    echo json_encode(['success' => true, 'id' => $id]);
    exit;
}

if ($method === 'POST') {
    $nome = $conn->real_escape_string($_POST['name']);
    $categoria = intval($_POST['category_id']);
    $userId = $_SESSION['user']['id'];
    $conditionId = intval($_POST['condition_id']);
    $usageTime = $conn->real_escape_string($_POST['usage_time']);

    $stmt = $conn->prepare("INSERT INTO products (name, user_id, category_id, condition_id, usage_time) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("siiis", $nome, $userId, $categoria, $conditionId, $usageTime);
    $stmt->execute();
    $productId = $stmt->insert_id;
    $productId = $conn->insert_id;


    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $imageName = $productId . '.' . strtolower($ext);
        $destPath = __DIR__ . "/../images/" . $imageName;
        move_uploaded_file($_FILES['image']['tmp_name'], $destPath);

        $imageUrl = "images/" . $imageName;
        $stmt = $conn->prepare("UPDATE products SET image=? WHERE id=?");
        $stmt->bind_param("si", $imageUrl, $productId);
        $stmt->execute();
    }

    echo json_encode(['success' => true, 'id' => $productId]);
    exit;
}


// if ($method === 'POST') {
//     $data = json_decode(file_get_contents('php://input'), true);
//     $nome = $conn->real_escape_string($data['name']);
//     $imagem = $conn->real_escape_string($data['image']);
//     $categoria = intval($data['category_id']);
//     $userId = intval($_SESSION['user']['id']);
//     error_log("Valor de categoria: " . print_r($categoria, true));
//     error_log("Dados recebidos: " . print_r($data, true));
//     $conn->query("INSERT INTO products (name, image, user_id, category_id ) VALUES ('$nome', '$imagem', '$userId', $categoria)");
//     echo json_encode(['success' => true, 'id' => $conn->insert_id]);
// }

if ($method === 'DELETE') {
    parse_str(file_get_contents("php://input"), $data);
    $id = intval($data['id']);
    $conn->query("DELETE FROM products WHERE id=$id");
    echo json_encode(['success' => true, 'message' => 'produto foi deletado', 'id' => $id]);
}
?>