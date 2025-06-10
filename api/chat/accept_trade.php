<?php
require '../db.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$tradeId = intval($data['trade_id']);
$userId = $_SESSION['user']['id'] ?? null;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

$stmt = $conn->prepare("UPDATE requests SET status='accepted' WHERE id=?");
$stmt->bind_param("i", $tradeId);
if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar status da solicitação']);
    exit;
}

$resRequest = $conn->query("SELECT product_id, requester_id FROM requests WHERE id=$tradeId");
if (!$resRequest) {
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar solicitação']);
    exit;
}
$row = $resRequest->fetch_assoc();
if (!$row) {
    echo json_encode(['success' => false, 'message' => 'Solicitação não encontrada']);
    exit;
}

$resProduct = $conn->query("SELECT user_id FROM products WHERE id=" . intval($row['product_id']));
if (!$resProduct) {
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar produto']);
    exit;
}
$productOwner = $resProduct->fetch_assoc()['user_id'] ?? null;
if (!$productOwner) {
    echo json_encode(['success' => false, 'message' => 'Produto não encontrado']);
    exit;
}

$user1 = $productOwner;
$user2 = $row['requester_id'];

if ($user1 > $user2) {
    $tmp = $user1;
    $user1 = $user2;
    $user2 = $tmp;
}

$stmt = $conn->prepare("SELECT id FROM conversations WHERE trade_id = ? AND user1_id = ? AND user2_id = ?");
$stmt->bind_param("iii", $tradeId, $user1, $user2);
$stmt->execute();
$resConv = $stmt->get_result();

if ($resConv && $resConv->num_rows > 0) {
    $conversationId = $resConv->fetch_assoc()['id'];
} else {
    $stmt = $conn->prepare("INSERT INTO conversations (trade_id, user1_id, user2_id) VALUES (?, ?, ?)");
    $stmt->bind_param("iii", $tradeId, $user1, $user2);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Erro ao criar conversa']);
        exit;
    }
    $conversationId = $conn->insert_id;
}

echo json_encode(['success' => true, 'conversation_id' => $conversationId]);
exit;