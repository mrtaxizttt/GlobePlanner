<?php
// Define the database path for Render (persistent directory or root directory)
$dbDir = '/var/data'; // Render persistent storage path if you create a disk, or fallback to local
if (!is_dir($dbDir)) {
    $dbDir = __DIR__;
}

$dbPath = $dbDir . '/globe_planner.db'; // Make sure the name is consistent

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create tables automatically if they do not exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        destination TEXT,
        university TEXT,
        start_date TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )");

} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
