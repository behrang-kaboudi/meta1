const express = require('express');
const puzzle = require('./puzzle');
const swiss = require('./swiss');
const fileUpload = require('express-fileupload');
const config = require('config');
const userValidator = require('../module/user/validate');
const jwt = require('jsonwebtoken');
const ut = require('../module/utility');
const user = require('../module/user/user');
const preregister = require('../module/user/preregister');
const Static = require('../module/static/static');
const rout = express.Router();

rout.get('/', (req, res) => {
  if (req.user.role != 'admin') {
    res.redirect('/');
    return;
  }
  res.render(config.get('template') + '/page/admin/dashboard', { user: req.user });
});

rout.get('/createStaticPage', (req, res) => {
  if (req.user.role != 'admin') {
    res.redirect('/');
    return;
  }
  res.render(config.get('template') + '/page/admin/createStaticPage', { user: req.user });
});
rout.get('/staticPageList', async (req, res) => {
  if (req.user.role != 'admin') {
    res.redirect('/');
    return;
  }
  let pages = await Static.find();
  res.render(config.get('template') + '/page/admin/staticPageList', { user: req.user, pages });
});
rout.get('/staticEdit/:id', async (req, res) => {
  if (req.user.role != 'admin') {
    res.redirect('/');
    return;
  }
  let content = await Static.findById(req.params.id);
  res.render(config.get('template') + '/page/admin/editStaticPage', { user: req.user, content });
});
rout.get('/puzzlesUpload', (req, res) => {
  if (req.user.role != 'admin') {
    res.redirect('/');
    return;
  }
  res.render(config.get('template') + '/page/admin/puzzlesUpload', { user: req.user });
});
rout.post('/puzzlesUpload', function (req, res) {
  let pgn = req.files.pgn;
  let file = process.env.mainDir + '/public/uploads/pgns/' + Date.now() + '.pgn';
  pgn.mv(file, function (err) {
    // if (err)
    //     return res.status(500).send(err);
    res.send('File uploaded!');
    puzzle.putPuzzlesInDb(file);
  });

  // console.log(req.files); // the uploaded file object
});
rout.get('/createSwissTournament', (req, res) => {
  if (req.user.role != 'admin') {
    res.redirect('/');
    return;
  }
  res.render(config.get('template') + '/page/game/swiss/createSwissTournament', { user: req.user });
});
rout.post('/createSwissTournament/', function (req, res) {
  // swiss.api.creatSwissTournament(req.body);
});
rout.io = {};
rout.io.creatStaticPage = async function (data) {
  let static = new Static(data);
  await static.save();
  return true;
  // console.log('d', data);
};
rout.io.editStaticPage = async function (data) {
  // let page = await Static.findById(data.id);
  let ans = await Static.updateOne(
    { _id: data.id },
    { $set: { title: data.title, content: data.content } },
  );

  console.log('d', ans);
  // let static = new Static(data)
  // await static.save();
  // return true;
  // console.log('d', data);
};

module.exports = rout;
