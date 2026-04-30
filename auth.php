<?php
session_start();
include 'db.php';

$action = $_GET['action'] ?? '';

// 1. Handle Registration
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'register') {
    $name = trim($_POST['name'] ?? '');
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';

    if (!$email || empty($name) || empty($password)) {
        http_response_code(400);
        exit(json_encode(["status" => "error", "message" => "Invalid or missing inputs."]));
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $hash]);
        echo json_encode(["status" => "success", "message" => "User registered successfully"]);
    } catch (PDOException $e) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "User already exists or invalid data."]);
    }
    exit();
}

// 2. Handle Login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';

    if (!$email || empty($password)) {
        http_response_code(400);
        exit(json_encode(["status" => "error", "message" => "Invalid credentials format"]));
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        echo json_encode(["status" => "success", "name" => $user['name']]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid credentials."]);
    }
    exit();
}

// 3. Handle Delete Profile
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        exit(json_encode(["status" => "error", "message" => "Unauthorized"]));
    }

    $userId = $_SESSION['user_id'];

    try {
        $pdo->beginTransaction();
        
        // Remove associated plans
        $stmt = $pdo->prepare("DELETE FROM plans WHERE user_id = ?");
        $stmt->execute([$userId]);

        // Remove the user
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);

        $pdo->commit();
        
        // Destroy session
        session_unset();
        session_destroy();
        
        echo json_encode(["status" => "success", "message" => "Profile deleted successfully."]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to delete profile."]);
    }
    exit();
}
?>
