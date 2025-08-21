const mongoose = require('mongoose');
const ut = require('../utility');
const jwt = require('jsonwebtoken');
const config = require('config');
const { tour } = require('../swiss/data');
const userSchema = new mongoose.Schema({
    //todo set upercase lowe case same email , username
    email: { type: String, unique: true, trim: true },
    userName: { type: String, unique: true, trim: true },
    password: { type: String, trim: true },
    role: { type: String, default: 'user' },
    registerTime: Number,
    link: String,
    bullet: { type: Number, default: 1400 },
    blitz: { type: Number, default: 1400 },
    rapid: { type: Number, default: 1400 },
    classic: { type: Number, default: 1400 },
    correspond: { type: Number, default: 1400 },
    puzzle: { type: Number, default: 1400 },
    recoveryLink: String,
    online: { type: Boolean, default: false },
    lang: { type: String, default: 'en' },
});
const User = mongoose.model('User', userSchema);
User.isInDb = async function (obj) {
    let dbUser = await User.findOne({ mobile: mobile });
    if (dbUser) return dbUser;
    return false;
};
User.creatNewUser = async function (user) {
    let dbUser = new User(user);
    let ans;
    try {
        ans = await dbUser.save();
    } catch (e) {
        ans = false;
    }
    return ans;
};
User.setUserFromCoockies = async function (req) {
    let userToken = User.setUserObjFromCoockies(req.headers.cookie);
    req.user = {};
    //   req.user.role = 'guest';
    //   req.user.id = null;
    req.user.login = false;
    if (userToken) {
        let dbUser = await User.findOne({
            _id: userToken.id,
            userName: userToken.userName,
            password: userToken.password,
        });
        if (dbUser) {
            req.user.login = true;
            req.user.dbProps = dbUser;
            dbUser.online = true;
            dbUser.save();
            return;
        }
        req.user.login = false;
        req.user.setToLogOut = true;
        return;
    }
};
User.setUserObjFromCoockies = function (mainCoockis) {
    let userToken = '';
    if (!mainCoockis) return userToken;
    let coockis = mainCoockis.split(';');

    coockis.forEach(element => {
        if (element.indexOf('user=') > -1) {
            userToken = element.split('=')[1];
            if (userToken) {
                userToken = jwt.verify(userToken, config.get('jwt'));
            }
        }
    });
    return userToken;
};
User.setOnline = function (userName, state) {
    User.updateOne({ userName }, { $set: { online: state } })
        .then(function (user) {
            // console.log(user);

        });
};
User.getOnlinePlayers = async function (userName, state) {
    let players = await User.find({ online: true });
    let pubPlayers = [];
    players.forEach((p) => {
        pubPlayers.push(User.setUserPublicData(p));
    })
    return pubPlayers;
};
User.getUserLoginCockie = function (dbUser) {
    let cooc = jwt.sign({ id: dbUser.id, userName: dbUser.userName, password: dbUser.password },
        config.get('jwt')
    );
    return cooc;
};
User.setUserPublicData = function (user) {
    let pub = {};
    if(!user)return null;//TODO
    pub.userName = user.userName;
    pub.bullet = user.bullet;
    pub.blitz = user.blitz;
    pub.rapid = user.rapid;
    pub.classic = user.classic;
    pub.correspond = user.correspond;
    pub.online = user.online;
    pub.lang == user.lang;
    return pub;
};


module.exports = User;