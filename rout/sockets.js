// src/sockets/index.js
// const attachAuth = require('./auth');
const { chat } = require('./chat');
const { router: gameRout } = require('./game');
const { router: userRout } = require('./user');
const { router: adminRout } = require('./admin');
const { router: puzzleRout } = require('./puzzle');
const { router: swissRout } = require('./swiss');
const { router: simullRout } = require('./simull');
const { router: challenge } = require('./chalenge');
const { setUserObjFromCookies } = require('./middlewares/setReqUser');
module.exports = function registerSocketHandlers(io) {
  io.use(attachAuth);
  io.on('connection', (socket) => {
    // فقط فرستنده/گیرنده واقعی بتوانند لغو کنند (بعداً rules اضافه کن)
    socket.on('chat', async function (data, ack) {
      await chat.ioF(data, ack, socket.data.user);
    });
    socket.on('chatMessage', function (massage, ack) {
      massage.userName = socket.data.user?.userName;
      gameRout.io.setMessage(massage).then(() => {
        gameRout.io.getGameData(massage.gameId).then((game) => {
          io.to('gameRome' + massage.gameId).emit('gameData', { game });
        });
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
    socket.on('newGameData', function (gameId, ack) {
      socket.join('gameRome' + gameId);
      gameRout.io.getGameData(gameId).then((game) => {
        io.to('gameRome' + gameId).emit('gameData', { game });
        if (game.result !== '' || game.whiteResult) io.emit('gameFinished', game);
      });
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
      await challenge.ioF(data, ack, socket.data.user);
    });

    socket.on('userPubData', function (u, ack) {
      userRout.io.getUserPublicData(u).then((answers) => {
        ack && ack(answers);
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
    socket.on('joinRoom', function (room, ack) {
      socket.join(room);
      if (ack) ack();
    });

    socket.on('leaveRoom', function (data, ack) {
      let roomName = roomNameMaker(data);
      socket.leave(roomName);
    });
  });
};
function attachAuth(socket, next) {
  const cookies = socket.handshake?.headers?.cookie || '';
  const u = setUserObjFromCookies(cookies);
  socket.data.user = u ? { ...u, login: true } : { login: false };

  if (socket.data.user.login) {
    socket.join(`user-${socket.data.user.userName}`);
  }
  next();
}
function roomNameMaker(obj) {
  let name = JSON.stringify(obj);
  return name;
}
