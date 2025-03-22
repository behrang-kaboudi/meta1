const fs = require('fs');
let ut = {};
ut.json = (obj) => { return JSON.parse(JSON.stringify(obj)) }
ut.joi = {
    persianLetter: 'چجحخهعغفقثصضگکمنتالبیسش/.وپدذرزطظ ّ َ َ ِ ُ ً ٍ ٌ ْ ة آ أ إ ي ئ ؤ ء ٔ ‌‌‌‌‌ٰژ ط ك ‍',
    englishLetter: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCV BNM',
    englishNumber: ' 1234567890',
    englishSpacialChars: `!@#$%^&*()_+-={}|[]\\:";'<>?,./`,
    PersianSpacialChars: `‍!٬٫ریال٪×،*)(ـ+}{|\\:؛><؟./})`,
};
ut.joi.getJoiPersianErrs = function (filedName) {
    let persianErrs = {
        'string.min': ` حداقل تعدا کاراکتر ${filedName} باید {#limit} کاراکتر باشد.`,
        'string.empty': ` فیلد ${filedName} نمیتواند خالی باشد.`,
        'string.base': `"a" should be a type of 'text'`,
        'any.required': `پر کردن فیلد ${filedName} اجباری میباشد.`,
        'string.email': ` فرمت ایمیل صحیح نوشته شود.`,
        'any.english': `  فیلد ${filedName} باید با حروف انگلیسی باشد.`,
        'any.persian': `  فیلد ${filedName} باید با حروف فارسی باشد.`,
    };
    return persianErrs;
};
ut.joi.english = (value, helpers) => {
    let src =
        ut.joi.englishLetter + ut.joi.englishNumber + ut.joi.englishSpacialChars;
    for (let i = 0; i < value.length; i++) {
        if (!(src.indexOf(value[i]) > -1)) {
            return helpers.error('any.english');
        }
    }
    return value;
};
ut.joi.persian = (value, helpers) => {
    for (let i = 0; i < value.length; i++) {
        if (!(ut.joi.persianLetter.indexOf(value[i]) > -1)) {
            return helpers.error('any.persian');
        }
    }
    return value;
};

ut.setCookies = function () {
    return (req, res, next) => {
        let cookies = req.headers.cookie;
        cookies = cookies.split(';');
        let obj = {};
        cookies.forEach(element => {
            let parts = element.split('=');
            let name = parts[0];
            let value = parts[1];
            obj[name] = value;
        });
        req.siteCookies = obj;
        next();
    };
};
ut.getRndInteger = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};
ut.jsonRes = function () {
    return { state: false, message: 'داده های ورودی اشتباه است' };
};
ut.gameTimeControll = function (game) {
    let totalTime = game.gameTimeMins * 60 + game.gameTimeSecs;
    return ut.timeControll(totalTime, game.timeIncresment);
};
/**
 * Returns game time control type.
 *
 * @param {number} mainTime main time in seconds  .
 * @param {number} timeIncresment ficsher time incresment.
 * @return {string} time control type.
 */
ut.timeControll = function (mainTime, timeIncresment = 0) {
    let totalTime = mainTime + 40 * timeIncresment;
    if (totalTime < 179) return 'bullet';
    if (totalTime < 479) return 'blitz';
    if (totalTime < 1499) return 'rapid';
    if (totalTime > 1500) return 'classic';
    // if (totalTime < 179) return 'correspond';
};
ut.copyObj = function (obj) {
    let obj2 = JSON.stringify(obj);
    return JSON.parse(obj2);
    // if (totalTime < 179) return 'correspond';
};
ut.log = {
    json: (data) => {
        fs.writeFile('./myLog/log.json', JSON.stringify(data), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    }
}
module.exports = ut;