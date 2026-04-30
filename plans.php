<?php
session_start();
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit(json_encode(["status" => "error", "message" => "Unauthorized access."]));
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// 1. Search / Retrieve Plans
if ($method === 'GET') {
    $search = trim($_GET['search'] ?? '');
    
    // Sanitize search term
    $search_param = '%' . htmlspecialchars($search) . '%';
    
    $stmt = $pdo->prepare("SELECT * FROM plans WHERE user_id = ? AND (destination LIKE ? OR university LIKE ?)");
    $stmt->execute([$user_id, $search_param, $search_param]);
    
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

// 2. Create / Write Plan
if ($method === 'POST') {
    $destination = trim($_POST['destination'] ?? '');
    $university = trim($_POST['university'] ?? '');
    $start_date = trim($_POST['start_date'] ?? '');

    // Validation
    if (empty($destination) || empty($university)) {
        http_response_code(400);
        exit(json_encode(["status" => "error", "message" => "Invalid form: Destination and University are required."]));
    }

    // Security sanitization to avoid script injection
    $destination = htmlspecialchars($destination);
    $university = htmlspecialchars($university);
    $start_date = htmlspecialchars($start_date);

    try {
        $stmt = $pdo->prepare("INSERT INTO plans (user_id, destination, university, start_date) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $destination, $university, $start_date]);
        
        echo json_encode(["status" => "success", "message" => "Plan written to database successfully!"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: Failed to insert plan."]);
    }
    exit();
}
?>
