const config = require('config');
const user = require('../module/user/user');
const crypto = require('crypto');
const { Router } = require('express');
const router = Router();
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const REPO = process.env.mainDir; // مثلا: /home/metaches/metaMain
const BRANCH = process.env.DEPLOY_BRANCH || 'main'; // main
const REMOTE = process.env.DEPLOY_REMOTE_URL; // https یا ssh (برای بار اول لازم است)
const NODE_BIN = process.env.NODE_BIN || ''; // مثلا: /home/.../node/v20.x/bin
const APP_NAME = process.env.PM2_APP_NAME || 'metachessmind.com';
const ECOSYS = process.env.PM2_ECOSYSTEM || 'ecosystem.config.js';

let deploying = false;

router.post('/git', function (req, res) {
  try {
    const sig = req.get('X-Hub-Signature-256');
    const bodyStr = JSON.stringify(req.body); // بهتره rawBody باشه، ولی برای سادگی همینی می‌ماند
    process.env.GH_WEBHOOK_SECRET = process.env.GH_WEBHOOK_SECRET || '1234'; // فقط برای تست لوکال
    const hmac = crypto
      .createHmac('sha256', process.env.GH_WEBHOOK_SECRET)
      .update(bodyStr)
      .digest('hex');
    const expectedSig = `sha256=${hmac}`;

    if (sig !== expectedSig) {
      console.log('in git invalid !!!!!!!!!!!!!!!!!!!!');
      return res.status(401).send('Invalid signature');
    }
    console.log('req.body?.ref', req.body?.ref);

    const evt = req.get('X-GitHub-Event'); // مثلا "push"
    if (evt === 'push' && req.body?.ref === `refs/heads/${BRANCH}`) {
      // if (process.env.NODE_ENV === 'production') {
      // پاسخ سریع بده، دیپلوی را بنداز عقبِ event loop
      res.status(200).json({ ok: true });
      return queueMicrotask(() => runDeploy().catch((err) => console.error('DEPLOY ERROR:', err)));
      // }
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Webhook error:', e);
    return res.status(500).send('Server error');
  }
});

module.exports = { path: '/webhooks/', router };

// ---------------------- Deploy ----------------------

async function runDeploy() {
  console.log('runDeploy1 .....');
  if (deploying) {
    console.log('Deploy already running, skipping…');
    return;
  }
  deploying = true;

  const npm = NODE_BIN ? path.join(NODE_BIN, 'npm') : 'npm';
  const pm2 = NODE_BIN ? path.join(NODE_BIN, 'pm2') : 'pm2';

  try {
    console.log('runDeploy2 .....');
    const boot = await ensureRepo(); // ← بار اول را مدیریت می‌کند
    console.log('runDeploy3 ......', boot);
    // همیشه به آخرین وضعیتِ ریموت سنک شو
    await run('git', ['fetch', '--all', '--prune'], { cwd: REPO });
    await run('git', ['reset', '--hard', `origin/${BRANCH}`], { cwd: REPO });

    // نصب پکیج‌ها (ci اگر قفل داشت؛ وگرنه install)
    const hasLock = fs.existsSync(path.join(REPO, 'package-lock.json'));
    try {
      if (hasLock) {
        await run(npm, ['ci', '--omit=dev'], { cwd: REPO });
      } else {
        await run(npm, ['install', '--omit=dev'], { cwd: REPO });
      }
    } catch {
      console.warn('npm ci failed, trying npm install…');
      await run(npm, ['install', '--omit=dev'], { cwd: REPO });
    }

    // بیلد
    await run(npm, ['run', 'build'], { cwd: REPO });

    // PM2: بار اول start، دفعات بعد startOrReload/reload
    const ecosystemExists = fs.existsSync(path.join(REPO, ECOSYS));
    if (ecosystemExists) {
      if (boot.startedFresh) {
        await run(pm2, ['start', ECOSYS], { cwd: REPO });
      } else {
        await run(pm2, ['startOrReload', ECOSYS], { cwd: REPO });
      }
    } else {
      const entry = path.join(REPO, 'index.js');
      if (boot.startedFresh) {
        await run(pm2, ['start', entry, '--name', APP_NAME], { cwd: REPO });
      } else {
        await run(pm2, ['reload', APP_NAME], { cwd: REPO }).catch(() =>
          run(pm2, ['start', entry, '--name', APP_NAME], { cwd: REPO }),
        );
      }
    }

    // اختیاری: برای بقا بعد از ریبوت
    // await run(pm2, ['save']);
    console.log('✅ Deploy finished');
  } finally {
    deploying = false;
  }
}

async function ensureRepo() {
  if (!REPO) throw new Error('ENV mainDir (DEPLOY_REPO_PATH) is required');

  // خطای "unsafe repository" را از بین ببر
  try {
    await run('git', ['config', '--global', '--add', 'safe.directory', REPO]);
  } catch {}

  // ساخت والد مسیر
  const parent = path.dirname(REPO);
  if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });

  const gitDir = path.join(REPO, '.git');
  if (!fs.existsSync(gitDir)) {
    if (!REMOTE) throw new Error('DEPLOY_REMOTE_URL is required for first-time setup');
    console.log('📦 First-time setup: cloning repository…');
    // clone در فولدر والد
    await run('git', ['clone', '--branch', BRANCH, '--single-branch', REMOTE, REPO], {
      cwd: parent,
    });
    return { startedFresh: true };
  }

  // اگر origin نداشت، اضافه کن
  try {
    await run('git', ['remote', 'get-url', 'origin'], { cwd: REPO });
  } catch {
    if (!REMOTE) throw new Error('origin is missing and DEPLOY_REMOTE_URL not provided');
    await run('git', ['remote', 'add', 'origin', REMOTE], { cwd: REPO });
  }

  // اطمینان از وجود/سوئیچ به BRANCH
  try {
    await run('git', ['rev-parse', '--verify', BRANCH], { cwd: REPO });
  } catch {
    await run('git', ['checkout', '-B', BRANCH, `origin/${BRANCH}`], { cwd: REPO });
  }

  return { startedFresh: false };
}

function run(cmd, args, opts) {
  console.log('run .....');
  return new Promise((resolve, reject) => {
    console.log(`$ ${cmd} ${args.join(' ')}`);
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
    p.on('error', reject);
  });
}
