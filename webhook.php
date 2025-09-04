<?php
// --- تنظیمات شما ---
$secret   = 'PUT-A-RANDOM-SECRET-HERE';                 // یک رشته رندوم قوی
$repoPath = '/home/metaches/metaMain';                  // مسیر پروژه روی هاست
$branch   = 'main';                                     // برنچ هدف
$logFile  = '/home/metaches/webhook.log';               // مسیر فایل لاگ (اختیاری)

// --- ابزار لاگ ---
function logMsg($msg) {
  global $logFile;
  @file_put_contents($logFile, '['.date('Y-m-d H:i:s')."] $msg\n", FILE_APPEND);
}

// --- امضای GitHub را راستی‌آزمایی کن (SHA-256) ---
$raw = file_get_contents('php://input');
$event = $_SERVER['HTTP_X_GITHUB_EVENT'] ?? '';
$sig256 = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';   // فرم توصیه شده
$calc = 'sha256=' . hash_hmac('sha256', $raw, $secret);

if ($event !== 'push') {
  http_response_code(202); echo "ignored (event=$event)"; exit;
}
if (!$sig256 || !hash_equals($calc, $sig256)) {
  logMsg("Bad signature");
  http_response_code(403); echo "Access denied (bad signature)"; exit;
}

// --- فقط وقتی push به برنچ هدف بود ---
$payload = json_decode($raw, true);
if (($payload['ref'] ?? '') !== "refs/heads/$branch") {
  http_response_code(202); echo "ignored (other branch)"; exit;
}

// --- اجرای دستورها: git pull + build + pm2 reload ---
// نکته: محیط PHP معمولا PATH/PROFILE ندارد؛ بنابراین مسیر Node/PM2 را صراحتاً ست کن.
$home = getenv('HOME') ?: '/home/metaches';
$nodeBin = $home.'/.nvm/versions/node/v22.14.0/bin';    // اگر Node دیگری داری، این خط را تغییر بده

$bash = <<<BASH
set -e
export HOME=$home
export PATH=$nodeBin:\$PATH
cd $repoPath
git fetch --all
git reset --hard origin/$branch
# اگر خصوصی است و با https نمی‌توانی pull کنی، باید origin را با PAT یا deploy key ست کنی.
npm ci --omit=dev
npm run build --if-present
pm2 startOrReload ecosystem.config.js
pm2 save
BASH;

$cmd = 'bash -lc ' . escapeshellarg($bash);
$out = []; $ret = 0;
exec($cmd . ' 2>&1', $out, $ret);

logMsg("Run result (code=$ret):");
foreach ($out as $line) logMsg($line);

if ($ret === 0) { echo "OK\n"; }
else { http_response_code(500); echo "FAILED (see log)\n"; }
