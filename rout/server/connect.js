// تابع connectToMongo(); در تست‌ها میک/غیرفعال می‌شود
const mongoose = require('mongoose');
const { MONGO_URI, ENV } = require('../../config/env');

async function connectToMongo() {
  await mongoose.connect(MONGO_URI);
  //todo: check connection
  //   mongoose
  //   .connect(MONGO_URI)
  //   .then(() => console.log(`[mongo] connected (${ENV})`))
  //   .catch((err) => console.error('[mongo] connection error:', err.message));
  console.log(`[mongo] connected (${ENV})`);
}

module.exports = { connectToMongo };
