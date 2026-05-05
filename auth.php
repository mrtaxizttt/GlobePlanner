<?php
require_once __DIR__ . '/db.php';
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$method = $_SERVER['REQUEST_METHOD'];
$input  = [];
$action = '';
if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
} elseif ($method === 'POST') {
    $input  = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $input['action'] ?? '';
}

switch ($action) {
    case 'register':       handleRegister($input); break;
    case 'login':          handleLogin($input);    break;
    case 'logout':         handleLogout();         break;
    case 'me':             handleMe();             break;
    case 'delete_account': handleDeleteAccount();  break;
    default: http_response_code(400); echo json_encode(['error' => 'Unknown action.']);
}

function handleRegister(array $data): void {
    $name = trim($data['name'] ?? ''); $email = trim($data['email'] ?? ''); $password = $data['password'] ?? '';
    if ($name===''||$email===''||$password==='') { http_response_code(422); echo json_encode(['error'=>'Name, email, and password are all required.']); return; }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(422); echo json_encode(['error'=>'Please provide a valid email address.']); return; }
    if (strlen($password)<8) { http_response_code(422); echo json_encode(['error'=>'Password must be at least 8 characters.']); return; }
    $pdo = getDB();
    $s = $pdo->prepare('SELECT id FROM users WHERE email = ?'); $s->execute([$email]);
    if ($s->fetch()) { http_response_code(409); echo json_encode(['error'=>'An account with that email already exists.']); return; }
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost'=>12]);
    $pdo->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')->execute([$name, $email, $hash]);
    $userId = (int)$pdo->lastInsertId();
    $_SESSION['user_id']=$userId; $_SESSION['user_name']=$name; $_SESSION['user_email']=$email;
    http_response_code(201);
    echo json_encode(['message'=>'Account created successfully.','user'=>['id'=>$userId,'name'=>$name,'email'=>$email]]);
}

function handleLogin(array $data): void {
    $email = trim($data['email'] ?? ''); $password = $data['password'] ?? '';
    if ($email===''||$password==='') { http_response_code(422); echo json_encode(['error'=>'Email and password are required.']); return; }
    $pdo = getDB();
    $s = $pdo->prepare('SELECT id, name, email, password FROM users WHERE email = ?'); $s->execute([$email]);
    $user = $s->fetch();
    if (!$user||!password_verify($password,$user['password'])) { http_response_code(401); echo json_encode(['error'=>'Invalid email or password.']); return; }
    session_regenerate_id(true);
    $_SESSION['user_id']=(int)$user['id']; $_SESSION['user_name']=$user['name']; $_SESSION['user_email']=$user['email'];
    echo json_encode(['message'=>'Login successful.','user'=>['id'=>(int)$user['id'],'name'=>$user['name'],'email'=>$user['email']]]);
}

function handleLogout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) { $p=session_get_cookie_params(); setcookie(session_name(),'',time()-3600,$p['path'],$p['domain'],$p['secure'],$p['httponly']); }
    session_destroy();
    echo json_encode(['message'=>'Logged out successfully.']);
}

function handleMe(): void {
    if (empty($_SESSION['user_id'])) { http_response_code(401); echo json_encode(['error'=>'Not authenticated.']); return; }
    echo json_encode(['user'=>['id'=>$_SESSION['user_id'],'name'=>$_SESSION['user_name'],'email'=>$_SESSION['user_email']]]);
}

function handleDeleteAccount(): void {
    if (empty($_SESSION['user_id'])) { http_response_code(401); echo json_encode(['error'=>'You must be logged in to delete your account.']); return; }
    $userId = (int)$_SESSION['user_id'];
    getDB()->prepare('DELETE FROM users WHERE id = ?')->execute([$userId]);
    $_SESSION = [];
    if (ini_get('session.use_cookies')) { $p=session_get_cookie_params(); setcookie(session_name(),'',time()-3600,$p['path'],$p['domain'],$p['secure'],$p['httponly']); }
    session_destroy();
    echo json_encode(['message'=>'Account deleted successfully.']);
}

function requireAuth(): int {
    if (session_status()===PHP_SESSION_NONE) session_start();
    if (empty($_SESSION['user_id'])) { header('Content-Type: application/json'); http_response_code(401); echo json_encode(['error'=>'You must be logged in to perform this action.']); exit; }
    return (int)$_SESSION['user_id'];
}
