const express = require('express');
const config = require('config');
const ut = require('../module/utility');
const user = require('../module/user/user');
const Static = require('../module/static/static');
const rout = express.Router();



rout.get('/page/:id', async (req, res) => {
    let content = await Static.findById(req.params.id);
    res.render(config.get('template') + '/page/static', { user: req.user, content });
});


// rout.get('/createSwissTournament', (req, res) => {
//     if (req.user.dbProps.role != 'admin') {
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