<?php
session_start();
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit(json_encode(["status" => "error", "message" => "Unauthorized access."]));
}

$user_id = $_SESSION['user_id'];
$method  = $_SERVER['REQUEST_METHOD'];

// ─────────────────────────────────────────────
// 1. GET — Search / Retrieve Plans
// ─────────────────────────────────────────────
if ($method === 'GET') {
    $search = trim($_GET['search'] ?? '');

    // FIX #4 (medium): removed htmlspecialchars() here — PDO binding already
    // prevents SQL injection. htmlspecialchars is for HTML output, not DB queries.
    $search_param = '%' . $search . '%';

    $stmt = $pdo->prepare(
        "SELECT * FROM plans WHERE user_id = ? AND (destination LIKE ? OR university LIKE ?)"
    );
    $stmt->execute([$user_id, $search_param, $search_param]);

    // FIX #7 (low): wrap result in {"plans":[...]} so script.js can read data.plans
    echo json_encode(["plans" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit();
}

// ─────────────────────────────────────────────
// 2. POST — Create Plan
// ─────────────────────────────────────────────
if ($method === 'POST') {
    // FIX #2 (critical): script.js sends JSON, not a form.
    // PHP does not populate $_POST from a JSON body, so we must decode it manually.
    $body        = json_decode(file_get_contents('php://input'), true) ?? [];
    $destination = trim($body['destination'] ?? '');
    $university  = trim($body['university']  ?? '');
    $start_date  = trim($body['start_date']  ?? '');

    if (empty($destination) || empty($university)) {
        http_response_code(400);
        exit(json_encode(["status" => "error", "message" => "Invalid form: Destination and University are required."]));
    }

    // FIX #5 (medium): removed htmlspecialchars() before INSERT — storing encoded
    // entities in the DB causes &amp; etc. to appear as literal text in the UI.
    // script.js already escapes output safely with its own escapeHtml() function.

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO plans (user_id, destination, university, start_date) VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([$user_id, $destination, $university, $start_date]);

        echo json_encode(["status" => "success", "message" => "Plan written to database successfully!"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: Failed to insert plan."]);
    }
    exit();
}

// ─────────────────────────────────────────────
// 3. DELETE — Remove a Plan
// ─────────────────────────────────────────────
if ($method === 'DELETE') {
    // FIX #3 (critical): DELETE method was completely missing.
    // script.js calls fetch('plans.php?id=X', {method:'DELETE'}) — without this
    // block the request fell through silently and caused a JSON parse error.
    $id = (int)($_GET['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        exit(json_encode(["status" => "error", "message" => "Invalid plan ID."]));
    }

    // The AND user_id = ? check ensures a user can only delete their own plans.
    $stmt = $pdo->prepare("DELETE FROM plans WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user_id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        exit(json_encode(["status" => "error", "message" => "Plan not found or access denied."]));
    }

    echo json_encode(["status" => "success", "message" => "Plan deleted successfully."]);
    exit();
}
?>
