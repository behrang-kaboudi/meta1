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
});
const Preregister = mongoose.model('Preregister', preregisterSchema);
Preregister.isInDb = async function(email, userName) {
    // to do expier time and delete from data base
    let dbUser = await Preregister.findOne({ email: email });
    if (dbUser)
        return 'با این ایمیل ثبت نام انجام شده. برای فعال سازی ایمیل خود را چک کنید.';
    dbUser = await Preregister.findOne({ userName: userName });
    if (dbUser) return 'نام کاربری دیگری برای خود انتخاب کنید.';
    // todo if is user database
    dbUser = await user.findOne({ email: email });
    if (dbUser)
        return 'با این ایمیل ثبت نام انجام شده. از قسمت فراموشی رمز عبور یا ورود اقدام کنید.';
    dbUser = await user.findOne({ userName: userName });
    if (dbUser) return 'نام کاربری دیگری برای خود انتخاب کنید';
    return false;
};
Preregister.getFromLink = async function(link) {
    let dbUser = await Preregister.findOne({ link: link });
    return dbUser;
};
Preregister.createNew = async function(preRegister) {
    preRegister.time = Date.now();
    preRegister.link =
        preRegister.userName + preRegister.time + ut.getRndInteger(123456, 987654);
    // preRegister.time = ut.getRndInteger (123456, 987654);
    let dbPreRegister = new Preregister(preRegister);
    return dbPreRegister.save();
};
module.exports = Preregister;