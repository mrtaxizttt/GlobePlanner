<?php
/**
 * plans.php — CRUD API for semester plans
 * Works with both SQLite and PostgreSQL (db.php handles the connection).
 */

if (session_status() === PHP_SESSION_NONE) session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/db.php';
// $pdo is available from db.php (both SQLite and PostgreSQL versions expose it)

// ── Auth check ─────────────────────────────────────────────────────────────
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    exit(json_encode(['error' => 'You must be logged in to manage plans.']));
}

$userId = (int) $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// ── GET — List or Search plans ─────────────────────────────────────────────
if ($method === 'GET') {
    $search = trim($_GET['search'] ?? '');
    $param  = '%' . $search . '%';

    $stmt = $pdo->prepare(
        'SELECT id, destination, university, start_date FROM plans
         WHERE user_id = ? AND (destination ILIKE ? OR university ILIKE ?)
         ORDER BY id DESC'
    );
    $stmt->execute([$userId, $param, $param]);
    echo json_encode(['plans' => $stmt->fetchAll()]);
    exit;
}

// ── POST — Create a plan ───────────────────────────────────────────────────
if ($method === 'POST') {
    $body        = json_decode(file_get_contents('php://input'), true) ?? [];
    $destination = trim($body['destination'] ?? '');
    $university  = trim($body['university']  ?? '');
    $start_date  = trim($body['start_date']  ?? '');

    if ($destination === '' || $university === '') {
        http_response_code(422);
        exit(json_encode(['error' => 'Destination and University are required.']));
    }
    if ($start_date === '') {
        http_response_code(422);
        exit(json_encode(['error' => 'Start date is required.']));
    }

    try {
        // PostgreSQL needs RETURNING id to get the new row's id;
        // SQLite ignores the RETURNING clause gracefully via lastInsertId().
        $stmt = $pdo->prepare(
            'INSERT INTO plans (user_id, destination, university, start_date)
             VALUES (?, ?, ?, ?) RETURNING id'
        );
        $stmt->execute([$userId, $destination, $university, $start_date]);
        $row   = $stmt->fetch();
        $newId = $row['id'] ?? $pdo->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'status'  => 'success',
            'message' => 'Plan saved successfully.',
            'plan'    => [
                'id'          => (int) $newId,
                'destination' => $destination,
                'university'  => $university,
                'start_date'  => $start_date
            ]
        ]);
    } catch (PDOException $e) {
        error_log('plans.php INSERT error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database error: could not save plan.']);
    }
    exit;
}

// ── DELETE — Remove a plan ─────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        exit(json_encode(['error' => 'Invalid plan ID.']));
    }

    // AND user_id = ? ensures users can only delete their own plans
    $stmt = $pdo->prepare('DELETE FROM plans WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $userId]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        exit(json_encode(['error' => 'Plan not found or access denied.']));
    }

    echo json_encode(['status' => 'success', 'message' => 'Plan deleted.', 'deleted_id' => $id]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed.']);
