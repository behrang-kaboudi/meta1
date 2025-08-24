process.env.mainDir = __dirname;
// require('events').EventEmitter.prototype._maxListeners = 100;
process.setMaxListeners(2000);
require('events').EventEmitter.prototype._maxListeners = 100;

const { app, io } = require('./rout/mainRout');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const ut = require('./module/utility');
const toolRout = require('./rout/tool');
const userRout = require('./rout/user');
const staticRout = require('./rout/static');
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

// var id = 0;
// var stockfish = require("./node_modules/stockfish/src/stockfish");
// var stockfishes = [];

// stockfishes[id] = new stockfish();

// stockfishes[id].onmessage = function (message) {
//     console.log("received: " + message);
// }
// console.log('', stockfishes[id]);

// stockfishes[id].postMessage('setoption name Contempt value 30');
// stockfishes[id].postMessage('setoption name Skill Level value 20');
// stockfishes[id].postMessage('ucinewgame');
// stockfishes[id].postMessage('isready');
// engine.onmessage = function (line) {
//     console.log("Line: " + line)
// }

// stockfishes[id].postMessage("ucinewgame");
// // engine.postMessage("position fen " + request.body.fen);

// stockfishes[id].postMessage("go depth 18");
// stockfish.postMessage("go depth 15");
// stockfish.onmessage = function (event) {
//     //NOTE: Web Workers wrap the response in an object.
//     console.log(event.data ? event.data : event);
// };
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*")
//     res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
//     res.header("Cross-Origin-Opener-Policy", "same-origin");
//     next();
// });

/// javafo.jar test.trfx -p test.txt
//  var child = require('child_process').spawn(
//     'java', ['-jar', __dirname + '/swp/javafo.jar', (__dirname + '/swp/' + 'test.trfx'), '-p', __dirname + '/swp/' +'test100.txt']
//   );
//   var child = require('child_process').spawn(
//     'java', [], { shell: true }
//   );
//   var child = require('child_process').spawn(
//     'java', ['-jar', './swp/javafo.jar', ('./swp/' + 'test.trfx'), '-p', './swp/' +'test100.txt']
//   );
//   child.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//   });

//   child.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//   });

//   child.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });

//   const { exec } = require('child_process');

//   const { execFile } = require('child_process');

//   var child2 = execFile(__dirname +"./swp/javafo.jar",  [__dirname +'./swp/test.trfx', '-p' ,__dirname +'./swp/test130.txt']);

app.get('/', (req, res) => {
  // res.render (config.get ('template') + '/page/home');

  res.render(config.get('template') + '/page/home', { user: req.user });
});

app.get('/test', (req, res) => {
  // res.render (config.get ('template') + '/page/home');
  res.render(config.get('template') + '/page/test', { user: req.user });
});

app.use('/tool/', toolRout);
app.use('/learn/', learnRout);
app.use('/static/', staticRout);
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

io.on('connect', function (socket) {
  let userData = null;
  let personalRoom = 'socketId';
  socket.use(async ([event, ...args], next) => {
    // if (event != 'staticFile') {
    userData = user.setUserObjFromCookies(socket.request.headers.cookie);
    if (userData) {
      // let dbUser = userRout.
      personalRoom = 'user-' + userData.userName;
      socket.join(personalRoom);
      user.setOnline(userData.userName, true);
      // userData.socket = socket;
      // io.emit('playerOnline', { userName: userData.userName, online: true });
    } else {
      userData = {};
    }
    // }
    userData.socket = socket;
    next();
  });
  socket.on('joinRoom', function (room, ack) {
    // let roomName = roomNameMaker(data)
    socket.join(room);
    if (ack) ack();

    // const arr = Array.from(io.sockets.adapter.rooms);
    // // Filter rooms whose name exist in set:
    // // ==> [['room1', Set(2)], ['room2', Set(2)]]
    // const filtered = arr.filter(room => !room[1].has(room[0]))
    // console.log('filtered',filtered);
    // // Return only the room name:
    // // ==> ['room1', 'room2']
    // const res = filtered.map(i => i[0]);

    // console.log('res:',res);
  });
  socket.on('leaveRoom', function (data, ack) {
    let roomName = roomNameMaker(data);
    socket.leave(roomName);
    // ack();
  });
  socket.on('staticFile', async function (data, ack) {
    let data1 = await readFile('./module/' + data.address, 'utf8');
    socket.emit('staticFile', { text: data1 });
  });
  //socket.on("disconnect", (reason) => {
  //     // to do sent are you online to rome if get answer not set offline
  //     user.setOnline(userData.userName, false);
  //     io.emit('playerOnline', { userName: userData.userName, online: false });
  // });

  socket.on('disconnect', (reason) => {
    // to do sent are you online to rome if get answer not set offline
    // if (userData) {
    // user.setOnline(userData.userName, false);
    // }
    // io.emit('playerOnline', { userName: userData.userName, online: false });
  });
  socket.on('changeLanguage', function (data, ack) {
    userRout.setUserLanguage(userData, data.lang).then(() => ack());
  });
  //ueser

  socket.on('onlineUsers', async (obj, ack) => {
    let users = await user.getOnlinePlayers();
    ack(users);
  });
  socket.on('liveGames', async (obj, ack) => {
    let games;
    if ('userName' in obj) {
      games = await gameRout.io.getLiveGames(obj.userName);
    } else {
      games = await gameRout.io.getLiveGames();
    }
    ack(games);
  });
  socket.on('topLiveGame', async (obj, ack) => {
    let game = await gameRout.io.getTopLiveGame();
    ack(game);
  });

  // socket.on('search', function(user, ack) {
  //     userRout.io.getUsersFromDbWhithPublicData(user).then(ansers => {
  //         ack(ansers);
  //     });
  // });userData
  socket.on('chalenge', async function (data, ack) {
    await chalenge.ioF(data, ack, userData);
  });

  // todo onle sender and reciver can cancel
  socket.on('chat', async function (data, ack) {
    await chat.ioF(data, ack, userData);
  });

  socket.on('newGameData', function (gameId, ack) {
    socket.join('gameRome' + gameId);
    gameRout.io.getGameData(gameId).then((game) => {
      io.to('gameRome' + gameId).emit('gameData', { game });
      if (game.result != '' || game.whiteResult) {
        io.emit('gameFinished', game);
      }
    });
  });
  socket.on('userPubData', function (user, ack) {
    userRout.io.getUserPublicData(user).then((ansers) => {
      ack(ansers);
    });
  });
  socket.on('gameMove', function (move, ack) {
    socket.join('gameRome' + move.gameId);
    gameRout.io.updateLastMove(move).then((game) => {
      if (game) {
        io.to('gameRome' + game._id).emit('gameData', { game });
      }

      ack('ansers');
    });
  });

  socket.on('resign', function (gameId, ack) {
    gameRout.io.resign(gameId, userData.userName).then((game1) => {
      gameRout.io.getGameData(gameId).then((game) => {
        io.to('gameRome' + gameId).emit('gameData', { game });
        if (game.result != '' || game.whiteResult) {
          io.emit('gameFinished', game);
        }
      });
    });
  });
  socket.on('offerDraw', function (obj, ack) {
    gameRout.io.offerDraw(obj.game._id, userData.userName).then(() => {
      gameRout.io.getGameData(obj.game._id).then((game) => {
        io.to('gameRome' + obj.game._id).emit('gameData', { game });
      });
    });
    // io
    //     .to('gameRome' + obj.game._id)
    //     .emit('offerDraw', { game: obj.game, userName: obj.userName });
    // ack('ansers');
  });
  socket.on('acceptDraw', function (gameId, ack) {
    gameRout.io.acceptDraw(gameId).then((game2) => {
      //
      gameRout.io.getGameData(gameId).then((game) => {
        io.to('gameRome' + gameId).emit('gameData', { game });
        if (game.result != '' || game.whiteResult) {
          io.emit('gameFinished', game);
        }
      });
    });
  });
  socket.on('chatMessage', function (massage, ack) {
    massage.userName = userData.userName;
    gameRout.io.setMessage(massage).then(() => {
      gameRout.io.getGameData(massage.gameId).then((game) => {
        io.to('gameRome' + massage.gameId).emit('gameData', { game });
      });
    });
  });
  // puzzle

  socket.on('newPuzzle', function (r, ack) {
    puzzleRout.io.getNewPuzzle(userData.userName).then((puzzle) => {
      // io.to ('gameRome' + gameId).emit ('gameData', {game});

      ack(puzzle);
    });
  });
  socket.on('puzzleAnswer', function (puzzle, ack) {
    puzzle.userName = userData.userName;
    puzzle.user = userData;
    puzzleRout.io.updateAnswer(puzzle).then((rtChange) => {
      ack(rtChange);
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
    // io.to (call.caller).emit ('callAnswer', call);
  });
  /// test
  socket.on('call', function (req) {
    if (req.candidate.type == 'offer') {
      io.to(req.users.callee).emit('call', req);
      return;
    }
    io.to(req.users.caller).emit('callAccepted', req);
  });
  socket.on('newCandidate', function (req) {
    if (req.candidate.type == 'offer') {
      io.to(req.users.callee).emit('newCandidate', req);
      return;
    }
    io.to(req.users.caller).emit('newCandidate', req);
  });
  // swiss tournament
  socket.on('swiss', async function (data, ack) {
    await swissRout.ioF(data, ack, userData);
  });
  // socket.on('logger', async function (data, ack) { await logger.ioF(data, ack, userData) });

  // simull
  socket.on('simul', async function (data, ack) {
    await simullRout.ioF(data, ack, userData);
  });
  socket.on('creatSimull', function (simulData, ack) {
    simullRout.io.creatSimull(simulData, userData);
    ack(simulData);
    // let pairing = require('./module/swiss/pairing');
    // pairing.pair(pairing.pairingData.playersList, pairing.pairingData.tour)
    // ack({ pairingData: pairing.pairingData });
  });
  socket.on('availableSimulls', async function (simullData, ack) {
    let simuls = await simullRout.io.available(userData);
    ack(simuls);
  });
  socket.on('joinSimull', async function (simullData) {
    let join = await simullRout.io.join(userData, simullData);
    if (join) {
      io.emit('updateAvailableSimulls');
    }
  });
  socket.on('withdrawSimull', async function (simullData) {
    let withdraw = await simullRout.io.withdraw(userData, simullData);
    if (withdraw) {
      io.emit('updateAvailableSimulls');
    }
  });
  socket.on('startSimull', async function (simullData) {
    let start = await simullRout.io.start(userData, simullData);
    if (start) {
      io.emit('updateAvailableSimulls');
      io.emit('simullStarted');
    }
  });

  socket.on('mySimullGames', async function (simullData, ack) {
    let simuls = await simullRout.io.myGames(userData);
    ack(simuls);
  });
  // searchIn games
  socket.on('searchInGames', async function (data, ack) {
    let games = await gameRout.io.searchInGames(data);
    // let simuls = await simullRout.io.myGames(userData)
    ack(games);
  });
  // staticPages
  socket.on('creatStaticPage', async function (data, ack) {
    // to do if not admin
    let ans = await adminRout.io.creatStaticPage(data);
    // let simuls = await simullRout.io.myGames(userData)

    ack(data);
  });
  socket.on('editStaticPage', async function (data, ack) {
    // to do if not admin
    let ans = await adminRout.io.editStaticPage(data);
    // let simuls = await simullRout.io.myGames(userData)

    ack(data);
  });
});
function roomNameMaker(obj) {
  // let name = obj.root;
  // if (obj.id) roomString += '-' + obj.id;
  // if (obj.field) roomString += '-' + obj.field;
  let name = JSON.stringify(obj);
  return name;
}

const test = require('./module/test');
const User = require('./module/user/user');
const { log } = require('console');
test.setIO(io);
