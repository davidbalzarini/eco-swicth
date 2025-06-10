<?php
set_time_limit(35);
require '../db.php';
session_start();

$conversationId = intval($_GET['conversation_id']);
$lastId = isset($_GET['last_id']) ? intval($_GET['last_id']) : 0;
$timeout = 30;
$start = time();

while ((time() - $start) < $timeout) {
    $result = $conn->query("SELECT * FROM chat_messages WHERE conversation_id=$conversationId AND id > $lastId ORDER BY id ASC");
    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
    if (count($messages) > 0) {
        echo json_encode(['messages' => $messages]);
        exit;
    }
    sleep(2);
}
echo json_encode(['messages' => []]);
?>