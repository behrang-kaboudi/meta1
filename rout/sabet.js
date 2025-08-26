const express = require('express');
const config = require('config');
const ut = require('../module/utility');
const user = require('../module/user/user');
const Static = require('../module/static/static');
const rout = express.Router();

rout.get('/team/', async (req, res) => {
  // const dev = process.env.NODE_ENV !== 'production';
  // res.render(config.get('template') + '/page/sabet/team', {
  //   user: req.user,
  //   dev,
  //   loaderSrc: dev
  //     ? 'http://localhost:5173/src/loader.jsx' // با root='react'
  //     : '/assets/loader.js',
  // });
  res.render(config.get('template') + '/page/sabet/team', {
    user: req.user,
  });
});
// rout.get('/team/', async (req, res) => {
//   // res.render(config.get('template') + '/page/sabet/search', { user: req.user });
//   res.render(config.get('template') + '/page/sabet/team', { user: req.user });
// });

// rout.get('/createSwissTournament', (req, res) => {
//     if (req.user.role != 'admin') {
//         res.redirect('/');
//         return;
//     }
//     res.render(config.get('template') + '/page/game/swiss/createSwissTournament', { user: req.user });
// });
// rout.post('/createSwissTournament/', function (req, res) {
//     // swiss.api.creatSwissTournament(req.body);

// });
// rout.io = {};
// rout.io.creatStaticPage = async function (data) {
//     let static = new Static({ data })
//     await static.save();
//     return true;
//     // console.log('d', data);
// }

module.exports = rout;
