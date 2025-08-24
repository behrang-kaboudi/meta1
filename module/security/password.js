const bcrypt = require('bcryptjs');

const PEPPER = process.env.PEPPER || '';
const COST = 12; // می‌تونی بعداً بالاتر ببری

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(COST);
  return bcrypt.hash(plain + PEPPER, salt);
}

async function verifyPassword(hash, plain) {
  return bcrypt.compare(plain + PEPPER, hash);
}

// اگر روزی cost را تغییر دادی، می‌تونی این را هوشمند کنی
function needsRehash(/* hash */) {
  return false;
}

module.exports = { hashPassword, verifyPassword, needsRehash };
