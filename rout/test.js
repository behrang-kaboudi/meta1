const { express } = require('./mainRout');
const config = require('config');
const { Router } = require('express');
const router = Router();
//pages
router.get('/test/', (req, res) => {
  res.render(config.get('template') + '/page/tool/analysisTest');
});

module.exports = { path: '/test', router };
