const mongoose = require('mongoose');
const user = require('./user');
const ut = require('../utility');
const jwt = require('jsonwebtoken');
const config = require('config');
const preregisterSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  userName: { type: String, unique: true },
  password: String,
  time: Number,
  link: String,
  passwordHash: { type: String },
  passwordAlgo: { type: String, default: 'bcrypt' },
});
const Preregister = mongoose.model('Preregister', preregisterSchema);
Preregister.isInDb = async function (email, userName) {
  let ansObj = { ans: true };
  let dbUser = await Preregister.findOne({ email: email });
  if (dbUser) {
    // ansObj.ans = false;
    // // return 'PreRegistration has been completed with this email. Check your email to activate. Or We can resend the activation email. Use resend button';
    // ansObj.user = dbUser;
    console.log('pre', dbUser);

    await dbUser.deleteOne();
  }
  dbUser = await user.findOne({ email: email });
  if (dbUser) {
    ansObj.message =
      'Registration has been completed with this email. Please use the Forgot Password or Login section.';
    return ansObj;
  }
  dbUser = await Preregister.findOne({ userName: userName });
  if (dbUser) {
    console.log(dbUser);

    ansObj.message = 'Choose another username for yourself1.';
    return ansObj;
  }
  dbUser = await user.findOne({ userName: userName });
  if (dbUser) {
    ansObj.message = 'Choose another username for yourself';
    return ansObj;
  }
  ansObj.ans = false;
  return ansObj;
};
Preregister.getFromLink = async function (link) {
  let dbUser = await Preregister.findOne({ link: link });
  return dbUser;
};
Preregister.createNew = async function (preRegister) {
  let dbPreRegister = new Preregister(preRegister);
  return dbPreRegister.save();
};
module.exports = Preregister;
