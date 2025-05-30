<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

function sendMail($to, $toName, $subject, $body, $altBody = '') {
    $mail = new PHPMailer(true);
    $username = $_ENV['username'];
    $passApp = $_ENV['passApp'];

    try {
        $mail->isSMTP();
        $mail->CharSet = 'UTF-8';
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = $username;
        $mail->Password = $passApp;
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        $mail->setFrom('eco-switch@gmail.com', 'Eco Switch');
        $mail->addAddress($to, $toName);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = $altBody;

        $mail->send();
        return ['success' => true, 'message' => 'Email enviado com sucesso!'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Erro: ' . $mail->ErrorInfo];
    }
}

function sendEmailConfirmation($email, $toName, $code) {
    $subject = 'Confirmação de Cadastro';
    $body = "
        <h1>Bem-vindo ao Eco Switch!</h1>
        <p>Olá $toName,</p>
        <p>Obrigado por se cadastrar no Eco Switch. Aqui está seu código de conifrmação:</p>
        <p><strong>Código: $code</strong></p>
        <p>Estamos felizes em tê-lo conosco!</p>
    ";
    return sendMail($email, $toName, $subject, $body);
}
?>




