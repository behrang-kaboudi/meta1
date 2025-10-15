const config = require('config');
const { Router } = require('express');
const router = Router();
//pages
router.get('/basics/', (req, res) => {
  res.render(config.get('template') + '/page/learn/basic/basic');
});
// router.get('/editor/bd1', (req, res) => {
//     res.render(config.get('template') + '/page/tool/bd1');
// });

// router.get('/analysis/', (req, res) => {
//     res.render(config.get('template') + '/page/tool/analysis');
// });
// router.get('/search/', (req, res) => {
//     res.render(config.get('template') + '/page/tool/search');
// });
module.exports = { path: '/sb/', router };
