const ut = require ('../utility');
const Joi = require ('joi');

const joiSchema = {
  mailUser: Joi.string ()
    .min (3)
    .messages (ut.joi.getJoiPersianErrs ('نام کاربری ایمیل')),
  mobile: Joi.string ().min (11).messages (ut.joi.getJoiPersianErrs ('موبایل')),
  password: Joi.string ()
    .min (3)
    .custom (ut.joi.english)
    .messages (ut.joi.getJoiPersianErrs ('رمز')),
  email: Joi.string ()
    .min (3)
    .email ()
    .custom (ut.joi.english)
    .messages (ut.joi.getJoiPersianErrs ('ایمیل')),
  userName: Joi.string ()
    .custom (ut.joi.english)
    .messages (ut.joi.getJoiPersianErrs ('نام کاربری')),
};
const validator = Joi.object (joiSchema);
function validate (reqBody) {
  let myRes = ut.jsonRes ();
  const validate = validator.validate (reqBody);
  if (validate.error) {
    myRes.message = validate.error.details[0].message;
  } else {
    myRes.state = true;
  }
  return myRes;
}

module.exports.validator = validate;
