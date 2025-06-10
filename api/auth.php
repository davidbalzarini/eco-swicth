<?php
header('Content-Type: application/json');
require 'db.php';
require 'email.php';

session_start();

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '/';

if ($method === 'GET' && $path === '/status') {
    if(isset($_SESSION['user'])) {
        $user = $_SESSION['user'];
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    }
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);


$TempUser = null;


if ($method === 'POST') {
    if ($path === '/logout') {
        unset($_SESSION['user']);
        session_write_close();
        echo json_encode(['success' => true, 'message' => 'Usuário deslogado com sucesso']);
        exit;
    }

    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
        exit;
    }
    if ($path === '/register') {


        $name = $conn->real_escape_string($data['name']);
        $email = $conn->real_escape_string($data['email']);
        $pass = $conn->real_escape_string($data['pass']);
        $repeat_pass = $conn->real_escape_string($data['repeat_pass'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'E-mail inválido']);
            exit;
        }
        if (empty($name) || strlen($name) < 2) {
            echo json_encode(['success' => false, 'message' => 'Nome inválido']);
            exit;
        }
        if (strlen($pass) < 6 ||
            !preg_match('/[a-z]/', $pass) ||
            !preg_match('/[A-Z]/', $pass) ||
            !preg_match('/[0-9]/', $pass)) {
            echo json_encode(['success' => false, 'field' => 'pass', 'message' => 'A senha deve ter ao menos 6 caracteres, incluir letras maiúsculas, minúsculas e números.']);
            exit;
        }
        if ($pass !== $repeat_pass) {
            echo json_encode(['success' => false, 'message' => 'As senhas não coincidem']);
            exit;
        }

        $check = $conn->query("SELECT id FROM users WHERE email='$email'");
        if ($check->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Email já cadastrado']);
            exit;
        }
        $code = rand(100000, 999999);

        $stmt = $conn->prepare("INSERT INTO pending_users (name, email, pass, code) VALUES (?, ?, ?, ?)");
        $pass = password_hash($pass, PASSWORD_BCRYPT);
        $stmt->bind_param("sssi", $name, $email, $pass, $code);
        $stmt->execute();
        sendEmailConfirmation($email, $name, $code);
        echo json_encode(['success' => true, 'message' => 'verifique seu email para completar o cadastro']);
        exit;
    }

    if($path === '/confirm'){
        $codeInput = $conn->real_escape_string($data['code']);

        $stmt = $conn->prepare("SELECT name, email, pass FROM pending_users WHERE code = ?");
        $stmt->bind_param("s", $codeInput);
        $stmt->execute();
        $result = $stmt->get_result();
        $pendingUser = $result->fetch_assoc();

        if (!$pendingUser) {
            echo json_encode(['success' => false, 'message' => 'Código inválido ou expirado']);
            exit;
        }

        $name = $pendingUser['name'];
        $email = $pendingUser['email'];
        $pass = $pendingUser['pass'];

        $stmt = $conn->prepare("INSERT INTO users (name, email, pass) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $name, $email, $pass);
        $stmt->execute();
        $stmt = $conn->prepare("DELETE FROM pending_users WHERE code = ?");
        $stmt->bind_param("s", $codeInput);
        $stmt->execute();
        echo json_encode(['success' => true, 'message' => 'Cadastro realizado com sucesso!']);
        exit;
    }

    if ($path === '/login') {
        $email = $conn->real_escape_string($data['email']);
        $pass = $conn->real_escape_string($data['pass']);
        $result = $conn->prepare("SELECT * FROM users WHERE email=?");
        $result->bind_param("s", $email);
        $result->execute();
        $result = $result->get_result();
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            if (!password_verify($pass, $user['pass'])) {
                echo json_encode(['success' => false, 'message' => 'Senha incorreta']);
                exit;
            }
            else{
                $_SESSION['user'] = $user;
                echo json_encode(['success' => true, 'user' => $user]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Email ou senha inválidos']);
        }
        exit;
    }




}



echo json_encode(['success' => false, 'message' => 'Rota ou método não suportado']);
?>