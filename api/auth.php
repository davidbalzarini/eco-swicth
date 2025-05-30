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
        $check = $conn->query("SELECT id FROM users WHERE email='$email'");
        if ($check->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Email já cadastrado']);
            exit;
        }
        $code = rand(100000, 999999);
        $_SESSION['TempUser'] = [
            'name' => $name,
            'email' => $email,
            'pass' => $pass,
            'code' => $code
        ];
        sendEmailConfirmation($email, $name, $code);
        echo json_encode(['success' => true, 'message' => 'verifique seu email']);
        exit;
    }

    if($path === '/confirm'){
        $codeInput = $conn->real_escape_string($data['code']);
        if (!isset($_SESSION['TempUser']) || $codeInput != $_SESSION['TempUser']['code']) {
            echo json_encode(['success' => false, 'message' => 'Código inválido']);
            exit;
        }
        $name = $_SESSION['TempUser']['name'];
        $email = $_SESSION['TempUser']['email'];
        $pass = password_hash($_SESSION['TempUser']['pass'], PASSWORD_BCRYPT);
        $conn->query("INSERT INTO users (name, email, pass) VALUES ('$name', '$email', '$pass')");
        unset($_SESSION['TempUser']);
        echo json_encode(['success' => true, 'message' => 'Cadastro realizado com sucesso!']);
        exit;
    }

    if ($path === '/login') {
        $email = $conn->real_escape_string($data['email']);
        $pass = $conn->real_escape_string($data['pass']);
        $result = $conn->query("SELECT * FROM users WHERE email='$email'");
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