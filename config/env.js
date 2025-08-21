// config/env.js
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const CWD = process.cwd();
const ENV = process.env.NODE_ENV || 'development';

// ترتیب بارگذاری (پایین‌تر → اولویت بالاتر و override)
const envFiles = [
  path.resolve(CWD, '.env'), // پایه (مشترک)
  path.resolve(CWD, `.env.${ENV}`), // مخصوص محیط فعلی
  path.resolve(CWD, '.env.local'), // محلی روی همه
  path.resolve(CWD, `.env.${ENV}.local`), // محلیِ مخصوص محیط
];

for (const p of envFiles) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, override: true });
  }
}

const PORT = Number(process.env.PORT) || 3000;

// اگر MONGO_URI مستقیماً تعریف شده باشد، همان را بگیر
let MONGO_URI = process.env.MONGO_URI;

// در غیر این صورت از قطعات بساز (پایه‌ها) + قطعات مخصوص محیط
if (!MONGO_URI) {
  const prefix = ENV === 'production' ? 'MONGO_PROD_' : 'MONGO_DEV_';

  const host = process.env[`${prefix}HOST`] || process.env.MONGO_HOST || 'localhost';
  const port = process.env[`${prefix}PORT`] || process.env.MONGO_PORT || '27017';
  const db = process.env[`${prefix}DB`] || process.env.MONGO_DB || 'test';
  const user = process.env[`${prefix}USER`] || process.env.MONGO_USER || '';
  const pass = process.env[`${prefix}PASS`] || process.env.MONGO_PASS || '';
  const params = process.env[`${prefix}PARAMS`] || process.env.MONGO_PARAMS || '';

  const auth = user && pass ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : '';
  const query = params ? `?${params}` : '';

  MONGO_URI = `mongodb://${auth}${host}:${port}/${db}${query}`;
}

module.exports = { PORT, MONGO_URI, ENV };
