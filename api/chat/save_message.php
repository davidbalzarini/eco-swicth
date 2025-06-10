<!-- <?php
require '../db.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);
$conversationId = intval($data['conversation_id']);
$content = $conn->real_escape_string($data['content']);
$senderId = $_SESSION['user']['id'];

$stmt = $conn->prepare("INSERT INTO chat_messages (conversation_id, sender_id, message_content) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $conversationId, $senderId, $content);
$stmt->execute();

$conn->query("UPDATE conversations SET last_message_at=NOW() WHERE id=$conversationId");

echo json_encode(['success' => true]);
?> -->