<?php
// notify.php
// Sends deadline reminder emails to the logged-in user.
// Uses Brevo (formerly Sendinblue) Transactional Email API — free tier allows
// 300 emails/day with no credit card required.
//
// SETUP REQUIRED:
//   1. Create a free account at https://app.brevo.com
//   2. Go to SMTP & API → API Keys → Generate a new API key
//   3. Add it to Render → Environment → BREVO_API_KEY
//   4. IMPORTANT: In Brevo → Settings → SMTP & API → Security,
//      DISABLE 'IP blocking' or add Render's outbound IP to the allowlist.
//      Without this, every API call will be rejected with a 401 error.

session_start();
header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    exit(json_encode(['error' => 'You must be logged in to send notifications.']));
}

$input     = json_decode(file_get_contents('php://input'), true) ?? [];
$deadlines = $input['deadlines'] ?? [];
$toEmail   = $_SESSION['user_email'] ?? '';
$toName    = $_SESSION['user_name']  ?? 'Student';

if (empty($deadlines)) {
    http_response_code(400);
    exit(json_encode(['error' => 'No deadlines provided.']));
}

if (!filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit(json_encode(['error' => 'No valid email address found for your account.']));
}

$apiKey = getenv('BREVO_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    exit(json_encode(['error' => 'Email service is not configured. Please contact the administrator.']));
}

// Build the email body
$lines = array_map(function($dl) {
    $date   = date('F j, Y', strtotime($dl['date']));
    $status = strtoupper($dl['status']);
    return "• {$dl['task']} — {$date} [{$status}]";
}, $deadlines);

$bodyText = "Hi {$toName},\n\nHere are your upcoming Globe Planner deadlines:\n\n"
          . implode("\n", $lines)
          . "\n\nLog in to Globe Planner to manage your plans.\n\nGood luck!";

$bodyHtml = "<p>Hi <strong>" . htmlspecialchars($toName) . "</strong>,</p>"
          . "<p>Here are your upcoming <strong>Globe Planner</strong> deadlines:</p><ul>"
          . implode('', array_map(fn($dl) =>
              "<li><strong>" . htmlspecialchars($dl['task']) . "</strong> — "
              . date('F j, Y', strtotime($dl['date']))
              . " <span style='color:#8b5cf6;font-weight:600;'>[" . strtoupper($dl['status']) . "]</span></li>",
              $deadlines))
          . "</ul><p>Log in to Globe Planner to manage your plans.</p><p>Good luck! 🌍</p>";

// Send via Brevo Transactional Email API
$payload = [
    'sender'      => ['name' => 'Globe Planner', 'email' => 'noreply@globeplanner.app'],
    'to'          => [['email' => $toEmail, 'name' => $toName]],
    'subject'     => '📅 Your Globe Planner Deadline Reminders',
    'textContent' => $bodyText,
    'htmlContent' => $bodyHtml,
];

$ch = curl_init('https://api.brevo.com/v3/smtp/email');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'api-key: ' . $apiKey,
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    echo json_encode([
        'status'  => 'success',
        'message' => "Reminder sent to {$toEmail}.",
    ]);
} else {
    $details = json_decode($response, true);
    http_response_code(502);
    echo json_encode([
        'error'   => 'Failed to send email. The mail service returned an error.',
        'details' => $details['message'] ?? $response,
    ]);
}
?>
