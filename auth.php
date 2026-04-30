<?php
session_start();
include 'db.php';

$action = $_GET['action'] ?? '';

// 1. Register User
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'register') {
    $name = trim($_POST['name'] ?? '');
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';

    if (!$email || empty($name) || empty($password)) {
        http_response_code(400);
        exit(json_encode(["status" => "error", "message" => "Invalid input: All fields are required."]));
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')");
        $stmt->execute([$name, $email, $hash]);
        echo json_encode(["status" => "success", "message" => "Registration successful! You can now log in."]);
    } catch (PDOException $e) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "Error: User with this email already exists."]);
    }
    exit();
}

// 2. Login User
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';

    if (!$email || empty($password)) {
        http_response_code(400);
        exit(json_encode(["status" => "error", "message" => "Email and password format are incorrect."]));
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_role'] = $user['role'];
        
        echo json_encode([
            "status" => "success", 
            "name" => $user['name'],
            "role" => $user['role']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid credentials. Please try again."]);
    }
    exit();
}

// 3. Delete Profile
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        exit(json_encode(["status" => "error", "message" => "Unauthorized access."]));
    }

    $userId = $_SESSION['user_id'];

    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("DELETE FROM plans WHERE user_id = ?");
        $stmt->execute([$userId]);

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);

        $pdo->commit();
        
        session_unset();
        session_destroy();
        
        echo json_encode(["status" => "success", "message" => "Profile and data deleted successfully."]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Server error: Unable to delete profile."]);
    }
    exit();
}
?>
