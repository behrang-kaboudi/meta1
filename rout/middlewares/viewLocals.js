//میان‌افزار res.locals مربوط به Vite/EJS
const fs = require('fs');
const path = require('path');
const config = require('config');

function createViewLocals(opts = {}) {
  const rootDir = opts.rootDir || process.env.mainDir || process.cwd();
  const assetsBase = opts.assetsBase || '/assets'; // باید در server.js استاتیکِ همین مسیر رو مونت کنی
  const isProdEnv = process.env.NODE_ENV === 'production';
  const isDevEnv = process.env.NODE_ENV === 'development';
  const isTestEnv = process.env.NODE_ENV === 'test';

  // مسیر manifest برای خروجی Vite (client build)
  const manifestPath = opts.manifestPath || path.join(rootDir, 'react', 'dist', 'manifest.json');

  // dev: آدرس Vite dev server (اگر در dev اجرا می‌کنی)
  const devOrigin = process.env.VITE_DEV_ORIGIN || 'http://localhost:5173';

  // manifest را یکبار در استارتاپ بخوانیم
  let manifest = null;
  if (isProdEnv) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (e) {
      console.warn('[viewLocals] manifest not found:', manifestPath, e.message);
    }
  }

  // کمک‌تابع: URL فایل استاتیک
  const asset = (entry) => {
    if (isProdEnv && manifest && manifest[entry]) {
      return assetsBase + '/' + manifest[entry].file;
    }
    // در dev، مستقیم از Vite سرو کن
    return `${devOrigin}/${entry}`;
  };

  // کمک‌تابع: لیست CSS های یک entry (در prod از manifest)
  const assetCSS = (entry) => {
    if (isProdEnv && manifest && manifest[entry]?.css) {
      return manifest[entry].css.map((f) => assetsBase + '/' + f);
    }
    return []; // در dev معمولاً CSS توسط Vite inject می‌شود
  };

  // کمک‌تابع: stringify ایمن برای HTML
  const json = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  // نسخه اپ (برای کش‌باستیگ)
  let appVersion = process.env.APP_VERSION;
  if (!appVersion) {
    try {
      appVersion = require(path.join(rootDir, 'package.json')).version;
    } catch {}
  }

  return function viewLocals(req, res, next) {
    res.locals.isProdEnv = isProdEnv;
    res.locals.isDevEnv = isDevEnv;
    res.locals.isTestEnv = isTestEnv;
    res.locals.env = process.env.NODE_ENV || 'development';
    res.locals.ASSETS_BASE = assetsBase;
    res.locals.asset = asset;
    res.locals.assetCSS = assetCSS;
    res.locals.json = json;
    res.locals.appVersion = appVersion || '0.0.0';
    res.locals.template = config.get('template');
    res.locals.user = req.user || null; // اگر از احراز هویت استفاده می‌کنی??????????????

    // برای dev: اسکریپت client خود Vite
    res.locals.vite = isProdEnv
      ? null
      : {
          origin: devOrigin,
          client: `${devOrigin}/@vite/client`,
        };

    // اگر خواستی بعداً CSP nonce اضافه کنی، اینجا بساز و در layout استفاده کن
    // const { randomBytes } = require('crypto');
    // res.locals.nonce = randomBytes(16).toString('base64');

    next();
  };
}

module.exports = createViewLocals;
