process.env.mainDir = __dirname;
process.env.Template = '25';
// require('events').EventEmitter.prototype._maxListeners = 100;
process.setMaxListeners(2000);
require('events').EventEmitter.prototype._maxListeners = 100;

/// اگر جای دیگری json parser داری، آن را بعد از این روت اضافه کن:
// app.use(express.json());

const { app, io } = require('./rout/mainRout');

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const ut = require('./module/utility');
const toolRout = require('./rout/tool');
const userRout = require('./rout/user');
const staticRout = require('./rout/static');
const sabetRout = require('./rout/sabet');
const adminRout = require('./rout/admin');
const gameRout = require('./rout/game');
const puzzleRout = require('./rout/puzzle');
const swissRout = require('./rout/swiss');
const simullRout = require('./rout/simull');
const learnRout = require('./rout/learn');
const user = require('./module/user/user');
const chalenge = require('./rout/chalenge');
const chat = require('./rout/chat');
const config = require('config');
const lang = require('./module/language/index');
// const lang2 = require('./module/language/index');
const staticDesign = require('./public/components/staticDesign/design');

app.use(userRout.setReqUser());
if (process.env.NODE_ENV === 'production') {
  process.env.isProd = 1;
  process.env.isDev = '';
}
if (process.env.NODE_ENV == 'development') {
  process.env.isProd = '';
  process.env.isDev = 1;
}
if (!process.env.isProd) console.log('xxxxxxxxxxxxxx');

const VITE_ORIGIN = process.env.VITE_ORIGIN || 'http://localhost:5173';

app.use((req, res, next) => {
  const dev = process.env.isDev;
  res.locals.dev = dev; // برای شرط‌های EJS
  res.locals.viteOrigin = VITE_ORIGIN; // آدرس dev server

  // به‌صورت پیش‌فرض برای همهٔ صفحات:
  res.locals.loaderSrc = dev
    ? `${VITE_ORIGIN}/src/loader.jsx` // DEV: از Vite
    : '/assets/loader.js'; // PROD: از خروجی build

  next();
});

app.get('/', (req, res) => {
  res.render(config.get('template') + '/page/home' + process.env.Template, { user: req.user });
});

app.get('/test', (req, res) => {
  // res.render (config.get ('template') + '/page/home');
  res.render(config.get('template') + '/page/testboard', { user: req.user });
});

app.use('/tool/', toolRout);
app.use('/learn/', learnRout);
app.use('/static/', staticRout);
app.use('/sb/', sabetRout);
app.use('/user/', userRout);
app.use('/admin/', adminRout);
app.use('/game/', gameRout);
app.use('/puzzle/', puzzleRout);
app.use('/swiss/', swissRout);
app.use('/simull/', simullRout);
app.get('/livegames/', (req, res) => {
  res.render(config.get('template') + '/page/game/games/liveGames', {
    user: req.user,
  });
});

// test
/// todo important
// const liveSwissPairing = require('./module/swiss/livePairing').livePairing(io);
// const creatGame = require('./module/swiss/creatGames');
// setTimeout(creatGame.pair, 3000)
// const pairing = require('./module/swiss/pairing');
// const Swiss = require('./module/swiss/swiss');
/// test÷

// ✅ فقط یک‌بار در زمان Handshake اجرا می‌شود
io.use((socket, next) => {
  const cookies = socket.handshake?.headers?.cookie || '';
  const u = user.setUserObjFromCookies(cookies);
  socket.data.user = u ? { ...u, login: true } : { login: false };

  if (socket.data.user.login) {
    socket.join(`user-${socket.data.user.userName}`);
  }
  next();
});
io.on('connection', function (socket) {
  socket.on('joinRoom', function (room, ack) {
    socket.join(room);
    if (ack) ack();
  });

  socket.on('leaveRoom', function (data, ack) {
    let roomName = roomNameMaker(data);
    socket.leave(roomName);
  });

  socket.on('staticFile', async function (data, ack) {
    let data1 = await readFile('./module/' + data.address, 'utf8');
    socket.emit('staticFile', { text: data1 });
  });

  socket.on('disconnect', (reason) => {});

  socket.on('changeLanguage', function (data, ack) {
    userRout.setUserLanguage(socket.data.user, data.lang).then(() => ack && ack());
  });

  // user
  socket.on('onlineUsers', async (obj, ack) => {
    let users = await user.getOnlinePlayers();
    ack && ack(users);
  });

  socket.on('liveGames', async (obj, ack) => {
    let games;
    if (obj && 'userName' in obj) {
      games = await gameRout.io.getLiveGames(obj.userName);
    } else {
      games = await gameRout.io.getLiveGames();
    }
    ack && ack(games);
  });

  socket.on('topLiveGame', async (obj, ack) => {
    let game = await gameRout.io.getTopLiveGame();
    ack && ack(game);
  });

  socket.on('search', function (q, ack) {
    userRout.io.getUsersFromDbWhithPublicData(q).then((answers) => {
      ack && ack(answers);
    });
  });

  socket.on('chalenge', async function (data, ack) {
    await chalenge.ioF(data, ack, socket.data.user);
  });

  // فقط فرستنده/گیرنده واقعی بتوانند لغو کنند (بعداً rules اضافه کن)
  socket.on('chat', async function (data, ack) {
    await chat.ioF(data, ack, socket.data.user);
  });

  socket.on('newGameData', function (gameId, ack) {
    socket.join('gameRome' + gameId);
    gameRout.io.getGameData(gameId).then((game) => {
      io.to('gameRome' + gameId).emit('gameData', { game });
      if (game.result !== '' || game.whiteResult) io.emit('gameFinished', game);
    });
  });

  socket.on('userPubData', function (u, ack) {
    userRout.io.getUserPublicData(u).then((answers) => {
      ack && ack(answers);
    });
  });

  socket.on('gameMove', function (move, ack) {
    socket.join('gameRome' + move.gameId);
    gameRout.io.updateLastMove(move).then((game) => {
      if (game) io.to('gameRome' + game._id).emit('gameData', { game });
      ack && ack('answers');
    });
  });

  socket.on('resign', function (gameId, ack) {
    const un = socket.data.user?.userName;
    gameRout.io.resign(gameId, un).then(() => {
      gameRout.io.getGameData(gameId).then((game) => {
        io.to('gameRome' + gameId).emit('gameData', { game });
        if (game.result !== '' || game.whiteResult) io.emit('gameFinished', game);
      });
    });
  });

  socket.on('offerDraw', function (obj, ack) {
    const un = socket.data.user?.userName;
    gameRout.io.offerDraw(obj.game._id, un).then(() => {
      gameRout.io.getGameData(obj.game._id).then((game) => {
        io.to('gameRome' + obj.game._id).emit('gameData', { game });
      });
    });
  });

  socket.on('acceptDraw', function (gameId, ack) {
    gameRout.io.acceptDraw(gameId).then(() => {
      gameRout.io.getGameData(gameId).then((game) => {
        io.to('gameRome' + gameId).emit('gameData', { game });
        if (game.result !== '' || game.whiteResult) io.emit('gameFinished', game);
      });
    });
  });

  socket.on('chatMessage', function (massage, ack) {
    massage.userName = socket.data.user?.userName;
    gameRout.io.setMessage(massage).then(() => {
      gameRout.io.getGameData(massage.gameId).then((game) => {
        io.to('gameRome' + massage.gameId).emit('gameData', { game });
      });
    });
  });

  // puzzle
  socket.on('newPuzzle', function (r, ack) {
    const un = socket.data.user?.userName;
    puzzleRout.io.getNewPuzzle(un).then((puzzle) => {
      ack && ack(puzzle);
    });
  });

  socket.on('puzzleAnswer', function (puzzle, ack) {
    puzzle.userName = socket.data.user?.userName;
    puzzle.user = socket.data.user;
    puzzleRout.io.updateAnswer(puzzle).then((rtChange) => {
      ack && ack(rtChange);
    });
  });

  /// call
  socket.on('callOffer', function (call) {
    io.to(call.callee).emit('offer', call);
  });
  socket.on('callAccepted', function (call) {
    io.to(call.caller).emit('callAnswer', call);
  });
  socket.on('iceCandidate', function (call) {
    // ...
  });

  /// test
  socket.on('call', function (req) {
    if (req.candidate.type === 'offer') {
      io.to(req.users.callee).emit('call', req);
      return;
    }
    io.to(req.users.caller).emit('callAccepted', req);
  });

  socket.on('newCandidate', function (req) {
    if (req.candidate.type === 'offer') {
      io.to(req.users.callee).emit('newCandidate', req);
      return;
    }
    io.to(req.users.caller).emit('newCandidate', req);
  });

  // swiss tournament
  socket.on('swiss', async function (data, ack) {
    await swissRout.ioF(data, ack, socket.data.user);
  });

  // simull
  socket.on('simul', async function (data, ack) {
    await simullRout.ioF(data, ack, socket.data.user);
  });

  socket.on('creatSimull', function (simulData, ack) {
    simullRout.io.creatSimull(simulData, socket.data.user);
    ack && ack(simulData);
  });

  socket.on('availableSimulls', async function (simullData, ack) {
    let simuls = await simullRout.io.available(socket.data.user);
    ack && ack(simuls);
  });

  socket.on('joinSimull', async function (simullData) {
    let join = await simullRout.io.join(socket.data.user, simullData);
    if (join) io.emit('updateAvailableSimulls');
  });

  socket.on('withdrawSimull', async function (simullData) {
    let withdraw = await simullRout.io.withdraw(socket.data.user, simullData);
    if (withdraw) io.emit('updateAvailableSimulls');
  });

  socket.on('startSimull', async function (simullData) {
    let start = await simullRout.io.start(socket.data.user, simullData);
    if (start) {
      io.emit('updateAvailableSimulls');
      io.emit('simullStarted');
    }
  });

  socket.on('mySimullGames', async function (simullData, ack) {
    let simuls = await simullRout.io.myGames(socket.data.user);
    ack && ack(simuls);
  });

  // searchIn games
  socket.on('searchInGames', async function (data, ack) {
    let games = await gameRout.io.searchInGames(data);
    ack && ack(games);
  });

  // staticPages
  socket.on('creatStaticPage', async function (data, ack) {
    let ans = await adminRout.io.creatStaticPage(data);
    ack && ack(data);
  });

  socket.on('editStaticPage', async function (data, ack) {
    let ans = await adminRout.io.editStaticPage(data);
    ack && ack(data);
  });
});

function roomNameMaker(obj) {
  let name = JSON.stringify(obj);
  return name;
}

const test = require('./module/test');
const User = require('./module/user/user');
const { log } = require('console');
test.setIO(io);
