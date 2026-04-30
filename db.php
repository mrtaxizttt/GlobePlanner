<?php
/**
 * db.php — Database Connection & Initialization
 * Globe/Erasmus Semester Planner
 *
 * Connects to the SQLite database file and creates the required
 * tables if they do not already exist (idempotent setup).
 */
 
define('DB_PATH', __DIR__ . '/globe_planner.db');
 
/**
 * Returns a PDO connection to the SQLite database.
 * Throws a RuntimeException if the connection fails.
 *
 * @return PDO
 */
function getDB(): PDO
{
    static $pdo = null; // Reuse the same connection within a single request
 
    if ($pdo === null) {
        try {
            $pdo = new PDO('sqlite:' . DB_PATH);
 
            // Throw exceptions on SQL errors instead of returning false
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
 
            // Return associative arrays by default
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
 
            // Enable WAL mode for better concurrent read performance
            $pdo->exec('PRAGMA journal_mode=WAL;');
 
            // Enforce foreign key constraints (SQLite disables them by default)
            $pdo->exec('PRAGMA foreign_keys = ON;');
 
            // Create tables on first run
            initSchema($pdo);
 
        } catch (PDOException $e) {
            // Never expose raw DB errors to the client in production
            error_log('Database connection failed: ' . $e->getMessage());
            http_response_code(500);
            die(json_encode(['error' => 'Database unavailable. Please try again later.']));
        }
    }
 
    return $pdo;
}
 
/**
 * Creates all required tables if they don't exist yet.
 * Safe to call on every request — uses CREATE TABLE IF NOT EXISTS.
 *
 * @param PDO $pdo
 */
function initSchema(PDO $pdo): void
{
    // ── Users table ──────────────────────────────────────────────
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT    NOT NULL,
            email     TEXT    NOT NULL UNIQUE,
            password  TEXT    NOT NULL,          -- bcrypt hash
            created_at TEXT   NOT NULL DEFAULT (datetime('now'))
        )
    ");
 
    // ── Plans table ───────────────────────────────────────────────
    // Each plan belongs to one user (user_id → users.id).
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS plans (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            destination TEXT    NOT NULL,
            university  TEXT    NOT NULL,
            start_date  TEXT    NOT NULL,        -- ISO-8601 date string, e.g. '2025-09-01'
            created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
            updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");
}