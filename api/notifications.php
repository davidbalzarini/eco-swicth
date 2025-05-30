<?php
header('Content-Type: application/json');
require 'db.php';

if (session_status() === PHP_SESSION_NONE) session_start();

$userId = $_SESSION['user']['id'];

$sql = "SELECT 
    r.id AS request_id,
    r.created_at,
    r.status,
    p.id AS product_id,
    p.name AS product_name,
    u.id AS requester_id,
    u.name AS requester_name,
    u.email AS requester_email
FROM requests r
JOIN products p ON r.product_id = p.id
JOIN users u ON r.requester_id = u.id
WHERE p.user_id = $userId
ORDER BY r.created_at DESC";

$result = $conn->query($sql);
$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}
echo json_encode($notifications);