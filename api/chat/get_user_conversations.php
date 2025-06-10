<?php
require '../db.php';
//session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
if (!isset($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}
$userId = $_SESSION['user']['id'];
$res = $conn->query("
SELECT c.*, 
    IF(c.user1_id = $userId, u2.name, u1.name) as other_user_name,
    IF(c.user1_id = $userId, u2.email, u1.email) as other_user_email,
    IF(c.user1_id = $userId, u2.id, u1.id) as other_user_id,
    CASE
        WHEN c.user1_id = $userId THEN p2.image
        ELSE p1.image
    END as other_user_product_image,
    CASE
        WHEN c.user1_id = $userId THEN p2.name
        ELSE p1.name
    END as other_user_product_name
FROM conversations c
JOIN users u1 ON c.user1_id = u1.id
JOIN users u2 ON c.user2_id = u2.id
JOIN requests r ON c.trade_id = r.id
JOIN products p1 ON r.product_id = p1.id
JOIN products p2 ON r.product_requester_id = p2.id
WHERE c.user1_id = $userId OR c.user2_id = $userId
ORDER BY c.last_message_at DESC
");
$convs = [];
while ($row = $res->fetch_assoc()) $convs[] = $row;
echo json_encode($convs);
?>