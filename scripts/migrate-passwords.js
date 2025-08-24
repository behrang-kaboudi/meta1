/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI, ENV } = require('../config/env');
const User = require('../module/user/user');
const { hashPassword, verifyPassword, needsRehash } = require('../module/security/password');

async function migratePasswords() {
  await mongoose
    .connect(MONGO_URI)
    .then(() => console.log(`[mongo] connected (${ENV})`))
    .catch((err) => console.error('[mongo] connection error:', err.message));
  console.log('Connected to DB');

  // پیدا کردن کاربرانی که پسورد هش ندارن ولی plain دارن
  const users = await User.find({
    passwordHash: { $in: [null, ''] },
    password: { $nin: [null, ''] },
  });

  console.log(`Found ${users.length} users with plain passwords.`);

  for (const user of users) {
    try {
      const hash = await hashPassword(user.password);
      user.passwordHash = hash;
      user.passwordAlgo = 'bcrypt';

      // اختیاری: پاک کردن plain password
      user.password = undefined;

      await user.save();
      console.log(`✔ Migrated user ${user.userName}`);
    } catch (err) {
      console.error(`✘ Failed for ${user.userName}`, err);
    }
  }

  //   console.log('Migration finished.');
  await mongoose.disconnect();
}

migratePasswords().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
