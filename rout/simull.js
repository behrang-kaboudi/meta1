const simullApi = require('../module/simull/simull');
const { router: gameRout } = require('./game');
const config = require('config');
const { Router } = require('express');
const router = Router();
router.get('/main/', (req, res) => {
  if (!req.user.login) {
    res.redirect('/user/login');
  }
  res.render(config.get('template') + '/page/game/simull/simull', {
    user: req.user,
  });
});
router.get('/new/', (req, res) => {
  if (!req.user.login) {
    res.redirect('/user/login');
  }

  res.render(config.get('template') + '/page/game/simull/new', {
    user: req.user,
  });
});
router.get('/game/:simullId', async (req, res) => {
  simullApi.get(req.params.simullId).then(async (sim) => {
    let game = await gameRout.api.getSimullGame(sim, req.user);
    var fullUrl = req.protocol + '://' + 'metachessmind.com' + '/game/play/' + game._id;
    res.redirect(fullUrl);
    // res.redirect('http://localhost:3000/simul'/game/play/' + game._id);
  });
  // = async function (simull) {
  //     co
  // if (!req.user.login) {
  //     res.redirect('/user/login');
  // }

  // res.render(config.get('template') + '/page/game/simull/new', {
  //     user: req.user
  // });
});
router.get('/hall/:id', (req, res) => {
  simullApi.get(req.params.id).then((sim) => {
    gameRout.io.getGameData({ _id: sim.games[0] }).then((gm) => {
      if (gm) {
        res.render(config.get('template') + '/page/game/play/play', {
          gameId: req.params.id.trim(),
          game: JSON.stringify(gm),
          simull: sim,
        });
      } else {
        res.redirect('/');
      }
    });
  });
});

router.io = {};
router.ioF = async function (data, ack, userData) {
  if (!data) return;
  await router.io[data.signal](data.data, ack, userData);
};
router.io.next = async function (data, ack, userData) {
  let simul = await simullApi.get(data.id);
  for (let i = 0; i < simul.games.length; i++) {
    const gmId = simul.games[i];
    let game = await gameRout.io.getGameData(gmId);
    if (!game.blackResult && !game.whiteResult) {
      let prop = game.sideToMove.side == 'b' ? 'black' : 'white';
      prop += 'UserName';
      if (game[prop] == simul.creatorUserName) {
        ack(game);
        return;
      }
    }
  }
  ack(false);
};
router.io.creatSimull = function (simullData, userData) {
  simullData.creatorUserName = userData.userName;
  simullData.clockTime = simullData.clockTime * 60;
  simullData.clockExtra = simullData.clockExtra * 60;
  simullApi.creat(simullData);
};
router.io.myGames = async function (userData) {
  return await simullApi.myGames(userData.userName);
};
router.io.available = async function (userData) {
  return await simullApi.available(userData.userName);
};
router.io.join = async function (userData, simullData) {
  return await simullApi.join(userData.userName, simullData.id);
};
router.io.withdraw = async function (userData, simullData) {
  return await simullApi.withdraw(userData.userName, simullData.id);
};
router.io.start = async function (userData, simullData) {
  return await simullApi.start(userData.userName, simullData.id);
};
module.exports = { path: '/simull/', router };
