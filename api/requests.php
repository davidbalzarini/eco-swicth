 <?php
 header('Content-Type: application/json');
require 'db.php';


if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '/';


if ($method === 'GET' && isset($_GET['product_id'])) {
    if (!isset($_SESSION['user']['id'])) {
        echo json_encode(['requested' => false]);
        exit;
    }
    $productId = intval($_GET['product_id']);
    $userId = intval($_SESSION['user']['id']);
    $result = $conn->query("SELECT id FROM requests WHERE product_id=$productId AND requester_id=$userId");
    echo json_encode(['requested' => $result->num_rows > 0]);
    exit;
}

if($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        $data = $_POST;
    }
    if (!isset($_SESSION['user']['id'])) {
        echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
        exit;
    }
    $productId = intval($data['product_id']);
    $requesterId = intval($_SESSION['user']['id']);
    $createdAt = date('Y-m-d H:i:s');
    $status = 'pending';
    error_log("product_id recebido: " . print_r($productId, true));
    $result = $conn->query("INSERT INTO requests (product_id, requester_id, created_at, status) VALUES ($productId, $requesterId, '$createdAt', '$status')");
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Pedido criado com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao criar pedido']);
    }
}



 
 
 
 ?>