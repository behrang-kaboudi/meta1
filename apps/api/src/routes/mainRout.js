const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
  // console.log(res.locals.user, '???????????????');

  res.render(res.locals.template + '/page/home' + process.env.TemplateNumber);
});
module.exports = { path: '/', router };
