<?php
require 'db.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$conversationId = intval($data['conversation_id']);
$userId = $_SESSION['user']['id'] ?? null;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

$res = $conn->query("SELECT trade_id FROM conversations WHERE id=$conversationId");
$row = $res->fetch_assoc();
if (!$row) {
    echo json_encode(['success' => false, 'message' => 'Conversa não encontrada']);
    exit;
}
$tradeId = $row['trade_id'];
$req = $conn->query("SELECT product_id, product_requester_id FROM requests WHERE id=$tradeId")->fetch_assoc();

$conn->query("DELETE FROM chat_messages WHERE conversation_id=$conversationId");
$conn->query("DELETE FROM conversations WHERE id=$conversationId");
$conn->query("DELETE FROM requests WHERE id=$tradeId");

echo json_encode(['success' => true]);
?>