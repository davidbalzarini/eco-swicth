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

$res = $conn->query("SELECT user1_id, user2_id, trade_id FROM conversations WHERE id=$conversationId");
$row = $res->fetch_assoc();
if (!$row) {
    echo json_encode(['success' => false, 'message' => 'Conversa não encontrada']);
    exit;
}
$field = ($row['user1_id'] == $userId) ? 'concluido_user1' : 'concluido_user2';

$conn->query("UPDATE conversations SET $field=1 WHERE id=$conversationId");

$res2 = $conn->query("SELECT concluido_user1, concluido_user2, trade_id FROM conversations WHERE id=$conversationId");
$status = $res2->fetch_assoc();
if ($status['concluido_user1'] && $status['concluido_user2']) {
    $tradeId = $status['trade_id'];
    $req = $conn->query("SELECT product_id, product_requester_id FROM requests WHERE id=$tradeId")->fetch_assoc();
    $conn->query("DELETE FROM chat_messages WHERE conversation_id=$conversationId");
    $conn->query("DELETE FROM conversations WHERE id=$conversationId");
    $conn->query("DELETE FROM requests WHERE id=$tradeId");
    $conn->query("DELETE FROM products WHERE id IN (" . intval($req['product_id']) . "," . intval($req['product_requester_id']) . ")");

    echo json_encode(['success' => true, 'finalizado' => true]);
    exit;
}

echo json_encode(['success' => true, 'finalizado' => false]);
?>