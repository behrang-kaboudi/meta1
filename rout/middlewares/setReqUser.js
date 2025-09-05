const jwt = require('jsonwebtoken');
const config = require('config');
function setReqUser() {
  return async function (req, res, next) {
    let userToken = setUserObjFromCookies(req.headers.cookie);
    req.user = {};
    //   req.user.role = 'guest';
    //   req.user.id = null;
    if (userToken) {
      req.user = { ...userToken };
      req.user.login = true;
    } else {
      req.user.login = false;
    }
    next();
  };
}
function setUserObjFromCookies(mainCookies) {
  let userToken = '';
  if (!mainCookies) return userToken;
  let cookies = mainCookies.split(';');

  cookies.forEach((element) => {
    if (element.indexOf('user=') > -1) {
      userToken = element.split('=')[1];
      if (userToken) {
        userToken = jwt.verify(userToken, config.get('jwt'));
      }
    }
  });
  return userToken;
}
module.exports = { setReqUser, setUserObjFromCookies };
