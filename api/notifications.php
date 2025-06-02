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
    p.image AS product_image,
    u.id AS requester_id,
    u.name AS requester_name,
    u.email AS requester_email,
    pr.id AS product_requester_id,
    pr.name AS product_requester_name,
    pr.image AS product_requester_image
FROM requests r
JOIN products p ON r.product_id = p.id
JOIN products pr ON r.product_requester_id = pr.id
JOIN users u ON r.requester_id = u.id
WHERE p.user_id = $userId
ORDER BY r.created_at DESC";

$result = $conn->query($sql);
$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}
echo json_encode($notifications);