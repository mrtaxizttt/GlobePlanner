<?php
// db.php — PostgreSQL version for Render
// Reads the DATABASE_URL environment variable injected by Render.

$url = getenv('DATABASE_URL');
if (!$url) {
    http_response_code(500);
    exit(json_encode(["status" => "error", "message" => "DATABASE_URL is not set."]));
}

// Parse the URL into PDO-compatible components.
$parts = parse_url($url);
$host  = $parts['host'];
$port  = $parts['port'] ?? 5432;
$db    = ltrim($parts['path'], '/');
$user  = $parts['user'];
$pass  = $parts['pass'];

$dsn = "pgsql:host=$host;port=$port;dbname=$db;sslmode=require";

try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Create tables if they do not exist.
    // PostgreSQL uses SERIAL instead of INTEGER PRIMARY KEY AUTOINCREMENT.
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id       SERIAL PRIMARY KEY,
        name     TEXT NOT NULL,
        email    TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role     TEXT DEFAULT 'user'
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS plans (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        destination TEXT NOT NULL,
        university  TEXT NOT NULL,
        start_date  TEXT
    )");

} catch (PDOException $e) {
    http_response_code(500);
    exit(json_encode(["status" => "error", "message" => "Database connection error: " . $e->getMessage()]));
}
?>
