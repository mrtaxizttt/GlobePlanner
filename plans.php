<?php
session_start();
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit(json_encode(["error" => "Unauthorized"]));
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// Requirement 1 & 2: Search info or read plans
if ($method === 'GET') {
    $search = trim($_GET['search'] ?? '');
    
    // Sanitize search string
    $search_param = '%' . $search . '%';
    
    $stmt = $pdo->prepare("SELECT * FROM plans WHERE user_id = ? AND (destination LIKE ? OR university LIKE ?)");
    $stmt->execute([$user_id, $search_param, $search_param]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

// Requirement 3: Write information (Create Plan)
if ($method === 'POST') {
    $destination = trim($_POST['destination'] ?? '');
    $university = trim($_POST['university'] ?? '');
    $start_date = trim($_POST['start_date'] ?? '');

    // Validation
    if (empty($destination) || empty($university)) {
        http_response_code(400);
        exit(json_encode(["status" => "error", "message" => "Destination and University are required."]));
    }

    // Sanitize data
    $destination = htmlspecialchars($destination);
    $university = htmlspecialchars($university);

    $stmt = $pdo->prepare("INSERT INTO plans (user_id, destination, university, start_date) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user_id, $destination, $university, $start_date]);
    
    echo json_encode(["status" => "success", "message" => "Plan created successfully."]);
    exit();
}
?>
