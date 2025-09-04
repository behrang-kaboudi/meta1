// process.env.PORT = process.env.PORT || 6678;
process.env.PORT = process.env.PORT || 3000;
const express = require('express');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const ioSocket = require('socket.io');
const mongoose = require('mongoose');
var viewEngine = require('consolidate');
const { MONGO_URI, ENV } = require('../config/env');
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`[mongo] connected (${ENV})`))
  .catch((err) => console.error('[mongo] connection error:', err.message));

const app = express();

// rout/mainRout.js  (بالای فایل، بعد از const app = express();)
// ⬅️ بالاترین بخش rout/mainRout.js ، بلافاصله بعد از: const app = express();
const crypto = require('crypto');
const { exec } = require('child_process');

// 1) خام‌گیر برای همین مسیر؛ هر چیزی قبل از این روی /webhook نادیده گرفته می‌شود
app.use('/webhook', express.raw({ type: '*/*' })); // */* تا اگر هدر اشتباه شد، باز Buffer بگیریم

// 2) خودِ روت وب‌هوک
app.post('/webhook', (req, res) => {
  try {
    const secret = process.env.GH_WEBHOOK_SECRET || '';
    const sig = req.get('x-hub-signature-256') || '';
    const event = req.get('x-github-event') || '';
    if (event !== 'push') return res.status(202).send('ignored');

    // اینجا باید Buffer باشد؛ اگر نبود یعنی ترتیب اشتباه است
    if (!Buffer.isBuffer(req.body)) {
      return res.status(500).send('raw body missing');
    }

    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(req.body).digest('hex');
    if (
      !sig ||
      expected.length !== sig.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
    ) {
      return res.status(403).send('bad signature');
    }

    const payload = JSON.parse(req.body.toString('utf8'));
    const BRANCH = process.env.DEPLOY_BRANCH || 'main';
    if ((payload.ref || '') !== `refs/heads/${BRANCH}`)
      return res.status(202).send('ignored branch');

    if (app.locals.__deploying) return res.status(202).send('deploy already running');
    app.locals.__deploying = true;

    const HOME = process.env.HOME || '/home/metaches';
    const REPO_PATH = process.env.DEPLOY_REPO_PATH || '/home/metaches/metaMain';
    const NODE_BIN = process.env.NODE_BIN || '/home/metaches/.nvm/versions/node/v22.14.0/bin';

    const script = `
      set -e
      export HOME=${HOME}
      export PATH=${NODE_BIN}:$PATH
      cd ${REPO_PATH}
      git fetch --all
      git reset --hard origin/${BRANCH}
      npm ci
      npm run build --if-present
      pm2 startOrReload ecosystem.config.js
      pm2 save
    `;

    exec(`bash -lc ${JSON.stringify(script)}`, { timeout: 10 * 60_000 }, (err, stdout, stderr) => {
      app.locals.__deploying = false;
      if (err) {
        console.error('DEPLOY ERROR:', err?.message, stderr);
        return res.status(500).send('deploy failed');
      }
      console.log('DEPLOY OK:\n', stdout);
      res.send('ok');
    });
  } catch (e) {
    app.locals.__deploying = false;
    console.error('WEBHOOK ERROR:', e);
    res.status(500).send('error');
  }
});

app.use('/public/', function (req, res, next) {
  let reqAddress = path.normalize(req.originalUrl).replace(/%20/g, ' ');
  reqAddress = path.normalize(reqAddress); //.replace(/\\/g, '/');
  reqAddress = path.join(process.env.mainDir, reqAddress);
  if (fs.existsSync(reqAddress)) {
    res.sendFile(reqAddress);
  } else {
    reqAddress = reqAddress.replace('public', 'node_modules');
    res.sendFile(reqAddress);
  }
  // next();
});
// درست: loader.js در ریشه‌ی dist است
app.use('/assets', express.static(path.resolve(process.env.mainDir, 'react/dist')));

app.use(express.json());
app.use(fileUpload());

app.engine('ejs', viewEngine.ejs);
app.set('view engine', 'ejs');

var server = app.listen(process.env.PORT);
var io = ioSocket(server);

let ioFuncs = {};
ioFuncs.connect = (socket, room) => {
  io.on('connect', () => {
    socket.join(room);
    console.log('joind');
  });
};

module.exports = { express, app, io, ioFuncs };
