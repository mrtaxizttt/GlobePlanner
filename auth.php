<?php
session_start();
include 'db.php';

// Handle Registration
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'register') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $hash = password_hash($password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $hash]);
        echo json_encode(["status" => "success", "message" => "User registered successfully"]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "User already exists or invalid data"]);
    }
    exit();
}

// Handle Login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        echo json_encode(["status" => "success", "name" => $user['name']]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    }
    exit();
}
    // Handle Delete Profile
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }
    
    $user_id = $_SESSION['user_id'];
    
    // Delete user's plans first to avoid foreign key errors
    $stmt = $pdo->prepare("DELETE FROM plans WHERE user_id = ?");
    $stmt->execute([$user_id]);
    
    // Delete the user from users table
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    
    // Log out current session
    unset($_SESSION['user_id']);
    unset($_SESSION['user_name']);
    session_destroy();
    
    echo json_encode(["status" => "success", "message" => "Profile successfully deleted"]);
    exit();
}
?>
