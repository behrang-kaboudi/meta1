const { Router } = require('express');
const router = Router();

router.get('/team/', (req, res) => {
  res.render(res.locals.template + '/page/sabet/team');
});
router.get('/mytest/', (req, res) => {
  res.render(res.locals.template + '/page/sabet/test');
});
module.exports = { path: '/sb/', router };
