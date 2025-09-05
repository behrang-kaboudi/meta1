const config = require('config');
const user = require('../module/user/user');
const { Router } = require('express');
const router = Router();

router.get('/', async (req, res) => {
  let content = await Static.findById(req.params.id);
  res.render(config.get('template') + '/page/static', { content });
});

router.post('/webhook', function (req, res) {
  console.log('in webhook !!!!!!!!!!!!!!!!!!!!');

  // swiss.api.creatSwissTournament(req.body);
  // res.cookie('user', myRes.message).send(JSON.stringify(myRes));
});
// router.io = {};
// router.io.creatStaticPage = async function (data) {
//     let static = new Static({ data })
//     await static.save();
//     return true;
//     // console.log('d', data);
// }
app.use('/git/', rout);
module.exports = { path: '/sb/', router };
