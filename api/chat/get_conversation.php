<!-- <?php
require '../db.php';
session_start();

$tradeId = intval($_GET['trade_id']);
$res = $conn->query("SELECT * FROM conversations WHERE trade_id=$tradeId");
if ($row = $res->fetch_assoc()) {
    echo json_encode($row);
} else {
    echo json_encode(null);
}
?> -->