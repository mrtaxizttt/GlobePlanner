<?php
/**
 * auth.php — Authentication Endpoints
 * Globe/Erasmus Semester Planner
 *
 * Handles three actions via POST request:
 *   action=register  → Create a new user account
 *   action=login     → Start a session for a returning user
 *   action=logout    → Destroy the current session
 *   action=me        → Return the currently logged-in user (GET)
 *
 * All responses are JSON.  HTTP status codes reflect success/failure.
 *
 * Usage examples (fetch from the frontend):
 *   POST /auth.php  { action:"register", name:"...", email:"...", password:"..." }
 *   POST /auth.php  { action:"login",    email:"...", password:"..." }
 *   POST /auth.php  { action:"logout" }
 *   GET  /auth.php?action=me
 */
 
require_once __DIR__ . '/db.php';
 
// ── Bootstrap ──────────────────────────────────────────────────────────────
 
// Start or resume the session before any output
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
 
// Always respond with JSON
header('Content-Type: application/json');
 
// Allow the frontend origin (adjust for your domain in production)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
 
// Handle CORS pre-flight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
 
// ── Route the request ──────────────────────────────────────────────────────
 
$method = $_SERVER['REQUEST_METHOD'];
$action = '';
 
if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
} elseif ($method === 'POST') {
    // Accept both form-encoded and JSON body
    $input  = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $input['action'] ?? ($_POST['action'] ?? '');
}
 
switch ($action) {
    case 'register': handleRegister($input ?? []); break;
    case 'login':    handleLogin($input ?? []);    break;
    case 'logout':   handleLogout();               break;
    case 'me':       handleMe();                   break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action. Use register, login, logout, or me.']);
}
 
// ── Handlers ───────────────────────────────────────────────────────────────
 
/**
 * POST { action:"register", name, email, password }
 * Creates a new user.  Returns the new user's id and name on success.
 */
function handleRegister(array $data): void
{
    // 1. Validate required fields
    $name     = trim($data['name']     ?? '');
    $email    = trim($data['email']    ?? '');
    $password =      $data['password'] ?? '';
 
    if ($name === '' || $email === '' || $password === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Name, email, and password are all required.']);
        return;
    }
 
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['error' => 'Please provide a valid email address.']);
        return;
    }
 
    if (strlen($password) < 8) {
        http_response_code(422);
        echo json_encode(['error' => 'Password must be at least 8 characters.']);
        return;
    }
 
    // 2. Check for duplicate email
    $pdo  = getDB();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
 
    if ($stmt->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode(['error' => 'An account with that email already exists.']);
        return;
    }
 
    // 3. Hash the password with bcrypt (cost factor 12)
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
 
    // 4. Insert the new user
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    $stmt->execute([$name, $email, $hash]);
 
    $userId = (int) $pdo->lastInsertId();
 
    // 5. Automatically log the user in after registration
    $_SESSION['user_id']   = $userId;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_email']= $email;
 
    http_response_code(201); // Created
    echo json_encode([
        'message' => 'Account created successfully.',
        'user'    => ['id' => $userId, 'name' => $name, 'email' => $email]
    ]);
}
 
/**
 * POST { action:"login", email, password }
 * Verifies credentials and starts a session.
 */
function handleLogin(array $data): void
{
    $email    = trim($data['email']    ?? '');
    $password =      $data['password'] ?? '';
 
    if ($email === '' || $password === '') {
        http_response_code(422);
        echo json_encode(['error' => 'Email and password are required.']);
        return;
    }
 
    // Fetch user by email
    $pdo  = getDB();
    $stmt = $pdo->prepare('SELECT id, name, email, password FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
 
    // Use password_verify() to safely compare against the stored bcrypt hash.
    // We deliberately give the same generic error for bad email OR bad password
    // to avoid leaking information about which accounts exist.
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password.']);
        return;
    }
 
    // Regenerate session ID to prevent session-fixation attacks
    session_regenerate_id(true);
 
    $_SESSION['user_id']    = (int) $user['id'];
    $_SESSION['user_name']  = $user['name'];
    $_SESSION['user_email'] = $user['email'];
 
    echo json_encode([
        'message' => 'Login successful.',
        'user'    => [
            'id'    => (int) $user['id'],
            'name'  => $user['name'],
            'email' => $user['email']
        ]
    ]);
}
 
/**
 * POST { action:"logout" }
 * Destroys the session and clears the session cookie.
 */
function handleLogout(): void
{
    // Clear session data
    $_SESSION = [];
 
    // Delete the session cookie from the browser
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(), '', time() - 3600,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
 
    session_destroy();
 
    echo json_encode(['message' => 'Logged out successfully.']);
}
 
/**
 * GET ?action=me
 * Returns the currently authenticated user, or 401 if not logged in.
 */
function handleMe(): void
{
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated.']);
        return;
    }
 
    echo json_encode([
        'user' => [
            'id'    => $_SESSION['user_id'],
            'name'  => $_SESSION['user_name'],
            'email' => $_SESSION['user_email']
        ]
    ]);
}
 
// ── Helper: require authentication (used by plans.php) ─────────────────────
 
/**
 * Ensures a valid session exists.
 * If not authenticated, sends a 401 response and exits.
 *
 * @return int  The authenticated user's ID
 */
function requireAuth(): int
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
 
    if (empty($_SESSION['user_id'])) {
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode(['error' => 'You must be logged in to perform this action.']);
        exit;
    }
 
    return (int) $_SESSION['user_id'];
}