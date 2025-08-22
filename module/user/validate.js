const ut = require ('../utility');
const Joi = require ('joi');

const joiSchema = {
  mailUser: Joi.string ()
    .min (3)
    .messages (ut.joi.getJoiEnglishErrs ('Username / Email')),
  mobile: Joi.string ().min (11).messages (ut.joi.getJoiEnglishErrs ('موبایل')),
  password: Joi.string ()
    .min (3)
    .custom (ut.joi.english)
    .messages (ut.joi.getJoiEnglishErrs ('Password')),
  email: Joi.string ()
    .min (3)
    .email ()
    .custom (ut.joi.english)
    .messages (ut.joi.getJoiEnglishErrs ('Email')),
  userName: Joi.string ()
    .custom (ut.joi.english)
    .messages (ut.joi.getJoiEnglishErrs ('Username')),
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
