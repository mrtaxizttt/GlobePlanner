<?php
// debug.php — live database viewer
// Visit: your-site.onrender.com/debug.php
require_once 'db.php';

// $pdo is created directly by db.php — getDB() is not available here.
// Remove this file or restrict access before submitting a real project.
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>DB Debug — Globe Planner</title>
    <style>
        body { font-family: monospace; padding: 2rem; background: #f8fafc; color: #0f172a; }
        h2   { margin-top: 2rem; }
        table { border-collapse: collapse; width: 100%; margin-top: 0.5rem; }
        th, td { border: 1px solid #cbd5e1; padding: 0.4rem 0.75rem; text-align: left; font-size: 0.875rem; }
        th { background: #e2e8f0; }
        tr:nth-child(even) { background: #f1f5f9; }
        .empty { color: #94a3b8; font-style: italic; }
    </style>
</head>
<body>

<h1>Globe Planner — Live Database</h1>
<p style="color:#64748b; font-size:0.85rem;">Refreshed on every page load. Reflects the current state of globe_planner.db.</p>

<h2>Users</h2>
<?php
$stmt = $pdo->query("SELECT id, name, email, role FROM users");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
if (empty($rows)): ?>
    <p class="empty">No users registered yet.</p>
<?php else: ?>
    <table>
        <tr><?php foreach (array_keys($rows[0]) as $col): ?><th><?= htmlspecialchars($col) ?></th><?php endforeach; ?></tr>
        <?php foreach ($rows as $row): ?>
            <tr><?php foreach ($row as $val): ?><td><?= htmlspecialchars((string)$val) ?></td><?php endforeach; ?></tr>
        <?php endforeach; ?>
    </table>
<?php endif; ?>

<h2>Plans</h2>
<?php
$stmt = $pdo->query("SELECT * FROM plans");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
if (empty($rows)): ?>
    <p class="empty">No plans saved yet.</p>
<?php else: ?>
    <table>
        <tr><?php foreach (array_keys($rows[0]) as $col): ?><th><?= htmlspecialchars($col) ?></th><?php endforeach; ?></tr>
        <?php foreach ($rows as $row): ?>
            <tr><?php foreach ($row as $val): ?><td><?= htmlspecialchars((string)$val) ?></td><?php endforeach; ?></tr>
        <?php endforeach; ?>
    </table>
<?php endif; ?>

</body>
</html>
