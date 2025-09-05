const { Router } = require('express');
const router = Router();

router.get('/team/', (req, res) => {
  res.render(res.locals.template + '/page/sabet/team');
});
module.exports = { path: '/sb/', router };
