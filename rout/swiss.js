const { express, io, ioFuncs } = require('./mainRout');
const Events = require('events');
const ut = require('../module/utility');
const config = require('config');
const swissTournament = require('../module/swiss/swiss');
const swissPlayers = require('../module/swiss/swissPlayers');
// const livePairing = require('../module/swiss/livePairing').funcs;
const rtGame = require('./game');
const Game = require('../module/game/game');
const pairing = require('../module/swiss/pairing');
const pairPlayers = require('../module/swiss/pairPlayers');
const { route } = require('./user');
const { json } = require('express');
const rout = express.Router();
let eventsNames = {
  create: 'create',
  register: 'register',
  withdraw: 'withdraw',
  change: 'change',
};
function roomName(parts) {
  return 'swiss-' + parts;
}
async function sendDataCreator(tr) {
  if (!tr) return {};
  let tour = JSON.parse(JSON.stringify(tr));
  let standing = await swissFuncs.getStandings(tr);
  standing = JSON.parse(JSON.stringify(standing));
  let games = await getPrimaryGamedData(standing);
  //todo games.sort()
  return { tour, standing, games };
}
async function getPrimaryGamedData(players) {
  let gameIds = [];
  players.forEach((p) => {
    p.gameIds.forEach((id) => {
      if (!gameIds.includes(id) && id != '-') {
        gameIds.push(id);
      }
    });
  });

  let games = [];
  for (let i = 0; i < gameIds.length; i++) {
    const id = gameIds[i];
    let g = await Game.findOne(
      { _id: id },
      'blackUserName whiteUserName blackResult whiteResult tournamentRound boardNo acceptedTime',
    );
    // games.push({ id: g })
    games.push(g);
  }
  return games;
}
pairing.event.on('finishPairing', async function (data) {
  // console.log('finishPairing', data);
  io.in('swiss-' + data.id).emit('data', {
    sender: 'finishPairing',
    root: 'swiss-' + data._id,
    data: await sendDataCreator(data),
  });
});
pairing.event.on('gameFinished', async function (tour) {
  // console.log('gameFinished', data);
  // let tour = await swissTournament.findById(game.tournamentId);
  io.in('swiss-' + tour._id).emit('data', {
    sender: 'gameFinished',
    root: 'swiss-' + tour._id,
    data: await sendDataCreator(tour),
  });
});

rout.event = new Events();
rout.event.on(eventsNames.create, async (tour) => {
  // io.in(JSON.stringify({ root: 'swiss' })).emit('swiss', ut.json({ event: eventsNames.create, data: tour }));
  io.in('swiss').emit('update', { root: 'swiss' });
});
// rout.event.on(eventsNames.register, async (tour)=> {
//     io.in(JSON.stringify({root:'swiss',id:tour._id})).emit('swiss',{event:eventsNames.register,data:tour});
// })
// rout.event.on(eventsNames.withdraw, async (tour)=> {
//     io.in(JSON.stringify({root:'swiss',id:tour._id})).emit('swiss',{event:eventsNames.withdraw,data:tour});
// })
rout.event.on(eventsNames.changed, async (tour) => {
  io.in('swiss-' + tour._id).emit('data', {
    root: 'swiss-' + tour._id,
    data: await sendDataCreator(tour),
  });
  io.in('swiss').emit('update', { root: 'swiss' });
});

rout.get('/edit/:id', async (req, res) => {
  if (req.user.role != 'admin') {
    res.redirect('/');
    return;
  }
  let sw = await swissTournament.findById(req.params.id);
  res.render(config.get('template') + '/page/game/swiss/edit', { user: req.user, swiss: sw });
});
rout.get('/test', async (req, res) => {
  res.render(config.get('template') + '/page/game/swiss/test', {
    user: req.user,
  });
});
rout.get('/tournaments/', async (req, res) => {
  let torns = await swissTournament.getNotStartedTounnaments();
  torns.reverse();
  torns = JSON.stringify(torns);
  torns = JSON.parse(torns);
  torns.forEach((element) => {
    element.hours = parseInt(element.gameDuration / 3600);
    let remain = element.gameDuration - element.hours;
    element.minutes = parseInt(remain / 60);
    element.seconds = element.gameDuration % 60;
    var date = new Date(element.startTime);
    element.date = date.toUTCString();
  });

  res.render(config.get('template') + '/page/game/swiss/trournaments', {
    user: req.user,
    tournaments: torns,
  });
});
rout.get('/tournament/:id', async (req, res) => {
  let sw = await swissTournament.findById(req.params.id).lean();
  // let swFull = await sendDataCreator(sw);
  // console.log("🚀 ~ file: swiss.js ~ line 116 ~ rout.get ~ swFull", swFull)
  res.render(config.get('template') + '/page/game/swiss/swiss', {
    user: req.user,
    tournament: sw,
    // standing: JSON.stringify(swFull.standing),
    // games: JSON.stringify(swFull.games)
    // registerd
  });
});
rout.get('/tournaments/regulation/:id', async (req, res) => {
  let sw = await swissTournament.api.getTournamentById(req.params.id);
  let registerd = sw.players.includes(req.user.userName) ? true : false;

  res.render(config.get('template') + '/page/game/swiss/regulation', {
    user: req.user,
    tournament: sw,
    registerd,
  });
});
rout.post('/register/', async (req, res) => {
  if (!req.user.login) {
    res.redirect('/user/login');
    return;
  }
  // to do if register time is over not register
  let tour = await swissTournament.getTournamentById(req.body.tournamentId);
  if (tour.status != 'open') {
    res.redirect('/swiss/tournaments/');
    return;
  }

  // to do mony
  if (tour.fee != 0) {
    res.redirect('/swiss/tournaments/');
    return;
  }
  if (tour.players.includes(req.user.userName)) {
    res.redirect('/swiss/tournaments/');
    return;
  }
  tour.players.push(req.user.userName);

  await tour.save();
  res.redirect('/swiss/RoundsInfo/players/' + tour._id);

  // let sw = await swissTournament.getTournamentById(req.params.id);
  // res.render(config.get('template') + '/page/game/swiss/regulation', {
  //     user: req.user,
  //     tournament: sw,
  // });
});
rout.get('/tournaments/RoundsInfo/:id', async (req, res) => {
  // let sw = await swissTournament.getTournamentById(req.params.id);
  // res.render(config.get('template') + '/page/game/swiss/regulation', {
  //     user: req.user,
  //     tournament: sw,
  // });
});

rout.io = {};

rout.api = {};
rout.ioF = async function (data, ack, userData) {
  if (!data) return;

  try {
    let ans = await rout.io[data.signal](data.data, ack, userData);
    if (ans && ack) ack(ans);
  } catch (error) {
    console.log('data.signal', data.signal, error);
  }
};

rout.io.tour = async (data, ack, userData) => {
  let tour = await swissTournament.findById(data.id);
  // let standing = await swissFuncs.getStandings(data.id);
  // console.log('ss', standing[1]['Buc' + 1]);
  // let games = await rtGame.api.getTournamentGames(data.id);
  // let games = await
  // io.in(userData.socket.id).emit(JSON.stringify({ root: 'swiss', event: 'data' }), ut.json({ tour, standing }));
  // io.in(userData.socket.id).emit(JSON.stringify({ root: 'swiss', event: 'data' }), { tour, standing });
  io.in(userData.socket.id).emit('data', {
    sender: 'rout.io.tour',
    root: 'swiss-' + data.id,
    data: await sendDataCreator(tour),
  });
};

// rout.io.join = async function (data, ack, userData) {

//     // todo remove swiss room
//     // if(!data.room)
//     if (!data.room || data.room == 'swiss') {
//         userData.socket.join('swiss' + data.id);
//         return;
//     }
//     ack(true);
// }

rout.io.register = async function (data, ack, userData) {
  if (!userData || !userData.userName) {
    // ack({ status: false, data: '/user/login' })
    return;
  }
  // todo if register time is over not register
  let tour = await swissTournament.findById(data.id);
  if (tour.status != 'open') {
    ack({ status: false, data: '/swiss/tournaments/' });
    return;
  }

  // todo money
  // if (tour.fee != 0) {
  //     res.redirect('/swiss/tournaments/');
  //     return;
  // }

  if (tour.players.includes(userData.userName)) {
    // ack({ status: false, data: '/swiss/tournaments/' })
    return;
  }
  tour.players.push(userData.userName);
  tour.markModified('players');
  await tour.save();
  io.to('swiss' + data.id).emit('swiss' + '-standings');
  // rout.event.emit(eventsNames.register, tour)
  rout.event.emit(eventsNames.changed, tour);
  // ack({ status: true })
  return;
};
rout.io.withdraw = async function (data, ack, userData) {
  if (!userData || !userData.userName) {
    ack({ status: false, data: '/user/login' });
    return;
  }
  // todo if close
  // todo money if open
  let tour = await swissTournament.findById(data.id);
  if (tour.status == 'open') {
    if (tour.players.includes(userData.userName)) {
      tour.players = tour.players.filter((p) => p != userData.userName);
      tour.markModified('players');
      await tour.save();
      //todo
      // rout.event.emit(eventsNames.withdraw, tour);
      rout.event.emit(eventsNames.changed, tour);
    }
  }
};

rout.io.create = async function (data, ack, userData) {
  let newSwiss = data;
  newSwiss.registerTime = Date.now();
  newSwiss.creator = userData.userName;

  let dbSwiss = new swissTournament(newSwiss);
  dbSwiss.rdStartTimes[0] = data.startTime;
  let tour = await dbSwiss.save();
  rout.event.emit(eventsNames.create, tour);
  ack(tour);
};
rout.io.playersCountInTour = async function (data, ack, userData) {
  // let tours = await swissTournament.find({status:'open',
  //     players: { "$in" : [userData.userName]}});
  // ack('xx');
};
rout.io.myOpens = async function (data, ack, userData) {
  let tours = await swissTournament.find({
    status: { $ne: 'finished' },
    players: { $in: [userData.userName] },
  });
  io.in(userData.socket.id).emit('myOpens', { root: 'swiss', data: tours });
};
rout.io.finished = async function (data, ack, userData) {
  let tours = await swissTournament.find({ status: 'finished' }).sort({ startTime: -1 }).limit(5);
  //todo emit all data by standard  userData.socket.id
  io.in(userData.socket.id).emit('finished', { root: 'swiss', data: tours });
  return tours;
};
rout.io.myTours = async function (data, ack, userData) {
  let tours = await swissTournament.find();
  ack(tours);
};
rout.io.upComing = async function (data, ack, userData) {
  let tours = await swissTournament.find({
    status: 'open',
    players: { $nin: [userData.userName] },
  });
  io.in(userData.socket.id).emit('upComing', { root: 'swiss', data: tours });
};
rout.io.onGoing = async function (data, ack, userData) {
  let tours = await swissTournament.find({
    status: 'closed',
    players: { $nin: [userData.userName] },
  });
  io.in(userData.socket.id).emit('onGoing', { root: 'swiss', data: tours });
};
rout.io.list = async function (data, ack, userData) {
  let tours = await swissTournament.find({ status: 'open' });
  ack(tours);
};
rout.io.putUsersIndb = async function (data, ack, userData) {
  let sw = await swissTournament.findById(data.id);
  pairing.putUsersIndb(sw);
};
rout.io.pair = async function (data, ack, userData) {
  let sw = await pairing.getPairingObj(data.id);
  if (sw) {
    await sw.pair();
    sw.event.on('finishPairing', function () {});
  }
  // ack(tours);
};

rout.io.onProcess = async function (data, ack, userData) {
  let tours = await swissTournament.find();
  ack(tours);
};
rout.io.myGames = async function (data, ack, userData) {
  if (!userData) {
    ack(null);
    return;
  }
  let player = await swissPlayers.findOne({ userName: userData.userName, tournamentId: data.id });
  if (!player) {
    ack(null);
    return;
  } else {
    let gms = [];
    for (let i = 0; i < player.gameIds.length; i++) {
      const gId = player.gameIds[i];
      if (gId == '-') {
        gms.push(null);
        continue;
      }
      let g = await rtGame.io.getGameData(gId);
      gms.push(g);
    }
    ack(gms);
  }
};

//todo remove below functions

// rout.io.standings = async function (data, ack, userData) {
//     ack(await swissFuncs.getStandings(data.id))
// }
rout.io.liveGame = async function (data, ack, userData) {
  let newSwiss = await swissTournament.findById(data.id);
  let game = await rtGame.api.getTourLiveGame({
    tournamentId: data.id,
    tournamentRound: newSwiss.round,
    boardNo: data.gameIndex,
  });
  if (game) {
    ack(game);
  }
  ack(false);
};
const swissFuncs = {};

swissFuncs.getStandings = async (tourOrId) => {
  let sw = tourOrId;
  if (typeof sw == 'string') sw = await swissTournament.findById(tourOrId);

  let players = [];

  if (!sw) return players;
  if (sw.round == 0) {
    let timeControl = ut.timeControll(sw.gameDuration, sw.extraTime);
    for (let i = 0; i < sw.players.length; i++) {
      const plName = sw.players[i];
      let newpl = await pairing.creatPlayerObj(plName, sw.id, timeControl);
      players.push(newpl);
    }
    pairPlayers.sortForPairing(players);
  } else {
    players = await swissPlayers.find({ tournamentId: sw._id }).lean();
    // await pairing.updateRoundResults(players, sw);
    swissPlayers.sortByBuchholz(players, 1);
    swissPlayers.sortByPoints(players);
  }
  return players;
};
// todo experimental
rout.io.reset = async function (data, ack, userData) {
  await Game.deleteMany({ tournamentId: data.id });
  await swissPlayers.deleteMany({ tournamentId: data.id });
  await swissTournament.updateOne({ _id: data.id }, { round: 0, status: 'open' });
};

module.exports = rout;
