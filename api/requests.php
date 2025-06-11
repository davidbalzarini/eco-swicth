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

if ($method === 'POST' && isset($_GET['batch_check'])) {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
      echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
      exit;
    }
    
    $userId = $_SESSION['user']['id'];
    $data = json_decode(file_get_contents("php://input"), true);
    $productIds = $data['product_ids'];
    
    if (empty($productIds)) {
      echo json_encode(['success' => true, 'results' => []]);
      exit;
    }
    
    $results = [];
    $productIdsString = implode(',', array_map('intval', $productIds));
    
    $query = "SELECT product_id FROM requests
             WHERE product_id IN ($productIdsString) AND requester_id = $userId";
    $result = $conn->query($query);
    
    while ($row = $result->fetch_assoc()) {
      $results[$row['product_id']] = true;
    }
    
    echo json_encode(['success' => true, 'results' => $results]);
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
    $productRequesterId = intval($data['product_requester_id']);
    $requesterId = intval($_SESSION['user']['id']);
    $createdAt = date('Y-m-d H:i:s');
    $status = 'pending';
    error_log("product_id recebido: " . print_r($productId, true));
    $result = $conn->query("INSERT INTO requests (product_id, requester_id, created_at, status, product_requester_id) VALUES ($productId, $requesterId, '$createdAt', '$status', $productRequesterId)");
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Pedido criado com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao criar pedido']);
    }
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['request_id']) && isset($data['status'])) {
        $requestId = intval($data['request_id']);
        $status = $data['status'];
        $stmt = $conn->prepare("UPDATE requests SET status=? WHERE id=?");
        $stmt->bind_param("si", $status, $requestId);
        $stmt->execute();
        echo json_encode(['success' => true]);
        exit;
    }
}



 
 
 
 ?>