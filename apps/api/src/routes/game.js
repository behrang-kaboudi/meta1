const hub = require("./hub");
const Events = require("events");
const ut = require("../models/utility");
const { Chess } = require("chess.js");
const config = require("config");
const user = require("../models/user/user");
const { router: userRout } = require("./user");
const chalenge = require("../models/chalenge/chalenge");
const game = require("../models/game/game");
const e = require("cors");
const { Router } = require("express");
const router = Router();
const primeryDelayTime = game.timeToStart;
router.event = new Events();
router.event.on("gameFinished", function (gm) {
  // todo
  // hub.to(JSON.stringify({root:'game',id:gm_id})).emit('gm')
});
// let gameInterVals = [];
router.get("/play/:id", async (req, res) => {
  let gm = await router.io.getGameData({ _id: req.params.id.trim() });
  if (!gm) {
    res.redirect("/");
  } else {
    res.render(config.get("template") + "/page/game/play/play", {
      gameId: req.params.id.trim(),
      game: JSON.stringify(gm),
    });
  }
});
router.get("/tournament/:id", (req, res) => {
  router.io.getGameData({ _id: req.params.id.trim() }).then((gm) => {
    if (gm) {
      res.render(config.get("template") + "/page/game/play/play", {
        gameId: req.params.id.trim(),
        game: JSON.stringify(gm),
      });
    } else {
      res.redirect("/");
    }
  });
});
router.get("/:id/", (req, res) => {
  chalenge.findOne({ _id: req.params.id, status: "waiting" }).then((ch) => {
    if (ch) {
      ch = ut.copyObj(ch);
      ch.gameTimeControll = ut.gameTimeControll(ch);
      res.render(config.get("template") + "/page/game/chalenge", {
        chalenge: ch,
      });
    } else {
      res.redirect("/");
    }
  });
});

setInterval(async function () {
  //router.io.getGameData
  let games = await game.find().and([{ whiteResult: null }, { result: "" }]);
  games.forEach(async (g) => {
    await router.io.getGameData(g.id);
  });
}, 10000);
router.io = {};

router.io.userSwissGames = async function (tour) {
  let games = await game
    .find({ tournamentId: tour.id })
    .or([{ blackUserName: tour.userName }, { whiteUserName: tour.userName }]);
  return games;
};
router.io.getLiveGames = async function (userName = null) {
  let games = await game.getLiveGames(userName);
  return games;
};
router.io.getTopLiveGame = async function () {
  let gm = await game.findOne({
    blackResult: null,
    whiteResult: null,
    result: "",
  });
  return gm;
};

router.io.getUsersFromDbWhithPublicData = async function (userName) {
  let users = await user
    .find({ userName: { $regex: ".*" + userName + ".*" } })
    .limit(10);
  let pubUsers = [];
  users.forEach((u) => {
    pubUsers.push(user.setUserPublicData(u));
  });
  return pubUsers;
};
router.io.createNewFromChalenge = async function (chalenge) {
  let newGame = {};
  newGame.rated = chalenge.rated;
  if (chalenge.selectedColor == "wb") {
    chalenge.selectedColor = Date.now() % 2 == 0 ? "w" : "b";
  }
  if (chalenge.selectedColor == "w") {
    newGame.whiteUserName = chalenge.requsterUserName;
    newGame.blackUserName = chalenge.opponentUserName;
  }
  if (chalenge.selectedColor == "b") {
    newGame.whiteUserName = chalenge.opponentUserName;
    newGame.blackUserName = chalenge.requsterUserName;
  }
  newGame.gameTimeMins = chalenge.gameTimeMins;
  newGame.gameTimeSecs = chalenge.gameTimeSecs;
  newGame.timeIncresment = chalenge.timeIncresment;
  newGame.acceptedTime = Date.now(); //Math.floor(Date.now() / 1000);
  let remainingtime = newGame.gameTimeMins * 60;
  remainingtime += newGame.gameTimeSecs;
  remainingtime *= 1000;
  newGame.blackRemainingTime =
    newGame.whiteRemainingTime =
    newGame.primeryTime =
      remainingtime;
  let timeControll = ut.gameTimeControll(chalenge);
  let black = await userRout.io.getUserPublicData(newGame.blackUserName);
  newGame.blackRate = black[timeControll];
  let white = await userRout.io.getUserPublicData(newGame.whiteUserName);
  newGame.whiteRate = white[timeControll];
  return await game.createNew(newGame);
};
router.io.updateLastMove = async function (move) {
  //todo convert to Func
  let gm = await game.findById(move.gameId);
  if (gm.whiteResult || gm.blackResult) {
    return false;
  }
  let gmForTiming = await router.io.getGameData(move.gameId);

  gm.offerDrawBy = null;
  let gm2 = addParamsToGame(gm);
  if (gm2.secsToStart > 0) return gm2;

  function updateEngine(chess, gm) {
    let gmMoves = gm.pgn.trim().split("--");
    for (let i = 0; i < gmMoves.length; i++) {
      let mv = gmMoves[i];
      if (mv) {
        mv = JSON.parse(mv);
        mv = chess.move(mv);
      }
    }
  }
  let chess = new Chess(gm.startPosition);
  updateEngine(chess, gm);
  let mv = chess.move(move);
  if (!mv) return gm2;

  if (gm2.tournamentType == "friendly") {
    if (gm2.firstMove.isFirstMove) {
      if (gm2.firstMove.remainingTime < 0 && gm2.firstMove.isFirstMove) {
        gm.result = "abort";
        await setForEndGame(gm, "abortUpdateLastMove");
        gm = await gm.save();
        return addParamsToGame(gm);
      }
      gm.whiteRemainingTime = gm.blackRemainingTime = gm.primeryTime;
      gm.moveDurations += " 0";
      gm.pgn += "--" + JSON.stringify(move);
      gm.lastMoveTime = Date.now();
      gm = await gm.save();
      return addParamsToGame(gm);
    }
  }
  (function updateLastMoveTime() {
    let lastMoveTime = Date.now(); //Math.floor(Date.now() / 1000);
    if (gm.lastMoveTime == 0) gm.lastMoveTime = gm.acceptedTime;
    gm.moveDurations += " " + (lastMoveTime - gm.lastMoveTime);
    gm.lastMoveTime = lastMoveTime;
  })();
  await updateMoveTimes(gm);

  if (gm.whiteResult || gm.blackResult) {
    gm = await gm.save();
    await setForEndGame(gm, "updateMoveTimes11");
    return addParamsToGame(gm);
  }
  gm.pgn += "--" + JSON.stringify(move);
  if (chess.game_over()) {
    gm.whiteResult = gm.blackResult = 1 / 2;
    if (chess.in_checkmate()) {
      gm.whiteResult = 0;
      gm.blackResult = 1;
      if (chess.turn() == "b") {
        gm.whiteResult = 1;
        gm.blackResult = 0;
      }
    }
    updateRating(gm);
  }
  gm = await gm.save();
  return addParamsToGame(gm);
};
router.io.getGameData = async function (gameId) {
  let gm = {};
  try {
    gm = await game.findById(gameId);
  } catch (error) {
    return false;
  }

  if (!gm) return false;
  if (gm.result != "" || gm.whiteResult || gm.blackResult)
    return addParamsToGame(gm);
  let gm2 = addParamsToGame(gm);
  async function upDateInDb() {
    gm = await gm.save();
    if (gm.whiteResult || gm.blackResult) {
      await setForEndGame(gm, "updateMoveTimes11");
    }
    return addParamsToGame(gm);
  }
  if (gm2.tournamentType == "friendly") {
    if (gm2.firstMove.isFirstMove) {
      if (gm2.firstMove.remainingTime < 0 && gm2.firstMove.isFirstMove) {
        gm.result = "abort";
        await setForEndGame(gm, "abort");
        return await upDateInDb();
      }

      gm.whiteRemainingTime = gm.blackRemainingTime = gm.primeryTime;
      // router.event.emit('gameFinished', addParamsToGame(gm))
      return await upDateInDb();
    }
  }
  // let gmTimeFinished =

  await updateMoveTimes(gm);

  gm = await upDateInDb();
  return gm;
};
router.io.searchInGames = async (data) => {
  let games = [];
  if (
    (!data.blackPlayers[0] && !data.whitePlayers[0]) ||
    data.opponent == "computer"
  )
    return games;
  function craetPlayersQueryArray(players, sideUserName) {
    let newPlayers = [];
    for (let i = 0; i < players.length; i++) {
      if (players[i]) {
        let obj = {};
        obj[sideUserName] = players[i];
        newPlayers.push(obj);
      }
    }
    return newPlayers;
  }

  if (data.setColor) {
    let blackUserNamePart = craetPlayersQueryArray(
      data.blackPlayers,
      "blackUserName"
    );
    let whiteUserNamePart = craetPlayersQueryArray(
      data.whitePlayers,
      "whiteUserName"
    );
    if (whiteUserNamePart.length == 0 || blackUserNamePart.length == 0) {
      games = await game.find().or(blackUserNamePart.concat(whiteUserNamePart)); //.and([{ pgn: { $ne: '' } }]);
    } else {
      games = await game.find({
        $and: [{ $or: blackUserNamePart }, { $or: whiteUserNamePart }],
      });
    }
  } else {
    let allUserBlack = craetPlayersQueryArray(
      data.blackPlayers.concat(data.whitePlayers),
      "blackUserName"
    );
    let allUserWhite = craetPlayersQueryArray(
      data.blackPlayers.concat(data.whitePlayers),
      "whiteUserName"
    );
    games = await game.find().or(allUserBlack.concat(allUserWhite)); //.and([{ pgn: { $ne: '' } }]);
    let mergedNames = data.blackPlayers.concat(data.whitePlayers);
    // if 2 parts are compleated che only for both
    if (data.blackPlayers[0] && data.whitePlayers) {
      games = games.filter((g) => mergedNames.includes(g.blackUserName));
    } else {
      games = games.filter(
        (g) =>
          mergedNames.includes(g.blackUserName) ||
          mergedNames.includes(g.whiteUserName)
      );
    }
  }
  // if (data.result != 'all') {
  //     if (data.result == 'white') games = games.filter(g => g.whiteResult == 1)
  //     if (data.result == 'black') games = games.filter(g => g.blackResult == 1)
  //     if (data.result == 'draw') games = games.filter(g => g.blackResult == 0.5)
  // }
  if (data.variant != "all") {
    games = games.filter((g) => ut.gameTimeControll(g) == data.variant);
  }
  if (data.startRating != "all") {
    let startRate = Number(data.startRating);
    games = games.filter(
      (g) => g.blackRate >= startRate && g.whiteRate >= startRate
    );
  }
  if (data.endRating != "all") {
    let endRate = Number(data.endRating);
    games = games.filter(
      (g) => g.blackRate <= endRate && g.whiteRate <= endRate
    );
  }
  if (data.mode != "all") {
    if (data.mode == "rated") {
      games = games.filter((g) => g.rated);
    } else {
      games = games.filter((g) => !g.rated);
    }
  }
  return games;
};

router.io.resign = async function (gameId, userName) {
  let gm = await game.findById(gameId);

  gm.whiteResult = 0;
  gm.blackResult = 1;
  if (userName == gm.blackUserName) {
    gm.whiteResult = 1;
    gm.blackResult = 0;
  }

  gm = await gm.save();
  updateRating(gm);
  await setForEndGame(gm, "resign");
  return gm;
};
router.io.offerDraw = async function (gameId, userName) {
  let gm = await game.findById(gameId);
  gm.offerDrawBy = userName;
  gm = await gm.save();
  return gm;
};
router.io.acceptDraw = async function (gameId, userName) {
  let gm = await game.findById(gameId);
  gm.whiteResult = gm.blackResult = 1 / 2;
  gm = await gm.save();
  updateRating(gm);
  await setForEndGame(gm, "acceptDraw");
  return gm;
};
router.io.setMessage = async function (message) {
  console.log("ssss");

  let mess = {
    message: message.message,
    userName: message.userName,
  };
  mess = JSON.stringify(mess);
  let up = await game.updateOne(
    { _id: message.gameId },
    { $push: { chats: mess } }
  );
};
router.api = {};
router.api.getSimullGame = async function (simull, user) {
  let wUser, bUser;
  if (simull.color == "w") {
    wUser = simull.creatorUserName;
    bUser = user.userName;
  }
  if (simull.color == "b") {
    wUser = user.userName;
    bUser = simull.creatorUserName;
  }
  let gm = await game.findOne({
    tournamentId: simull._id,
    whiteUserName: wUser,
    blackUserName: bUser,
  });
  return gm;
};
router.api.getTourLiveGame = async function (gameData) {
  let gm = await game.findOne(gameData);
  return gm;
};
router.api.create = async function (gm) {
  return await game.createNew(gm);
};
router.api.getTournamentGames = async function (tourId, lean) {
  if (lean) return await game.find({ tournamentId: tourId }).lean();
  return await game.find({ tournamentId: tourId });
};
router.api.getTournamentRdGames = async function (tourId, rd) {
  return await game.find({ tournamentId: tourId, tournamentRound: rd });
};
router.api.getTournamentOpenGames = async function (tourId) {
  return await game.find({
    tournamentId: tourId,
    blackResult: null,
    result: "",
  });
};
router.api.getTournamentGame = async function (p1, p2) {
  return await game.find(
    { tournamentId: tourId },
    { blackResult: null },
    { result: "" }
  );
};
router.api.getTournamentOneGame = async function (tourId, rd) {
  return await game.findOne({ tournamentId: tourId, tournamentRound: rd });
};
router.api.userSwissGames = async function (tourId, userName) {
  let games = await game
    .find({ tournamentId: tourId })
    .or([{ blackUserName: userName }, { whiteUserName: userName }]);
  return games;
};
module.exports = { path: "/game/", router };

function addParamsToGame(game) {
  let gm2 = JSON.parse(JSON.stringify(game));
  let gmMoves = [];
  if (gm2.pgn) {
    gmMoves = gm2.pgn.replace("--", "").split("--");
  }
  gm2.gmMoves = gmMoves;

  function getSideToMove() {
    if (gm2.gmMoves.length % 2 == 1) {
      return { side: "b", dictate: "سیاه" };
    }
    return { side: "w", dictate: "سفید" };
  }
  gm2.sideToMove = getSideToMove(gm2);

  function getFirstMove() {
    let firstMove = { isFirstMove: false, remainingTime: 0 };
    if (gm2.gmMoves.length < 2) {
      firstMove.isFirstMove = true;
    }
    if (gm2.sideToMove.side == "w") {
      firstMove.remainingTime =
        primeryDelayTime - (Date.now() - gm2.acceptedTime) / 1000;
    }
    if (gm2.sideToMove.side == "b") {
      firstMove.remainingTime =
        primeryDelayTime - (Date.now() - gm2.lastMoveTime) / 1000;
    }
    firstMove.remainingTime = Math.round(firstMove.remainingTime);

    return firstMove;
  }
  gm2.firstMove = getFirstMove(gm2);
  gm2.timeControll = ut.gameTimeControll(game);
  if (gm2.whiteResult || gm2.blackResult) {
    gm2.result = gm2.whiteResult + " - " + gm2.blackResult;
  }
  (function getTimeToStart() {
    gm2.secsToStart = Math.round((gm2.acceptedTime - Date.now()) / 1000);
  })();
  if (gm2.result != "abort") {
    if (gm2.result != "" || gm2.whiteResult || gm2.blackResult) {
      let brt = calculateRatingChange(
        gm2.blackRate,
        gm2.whiteRate,
        gm2.blackResult
      );
      let wrt = calculateRatingChange(
        gm2.whiteRate,
        gm2.blackRate,
        gm2.whiteResult
      );
      gm2.bRateChange = brt;
      gm2.wRateChange = wrt;
    }
  }
  return gm2;
}

async function setForEndGame(game1, sender) {
  console.log("sender", sender, game1._id);
  removeTimer(game1);
  let gm = addParamsToGame(game1);
  let dbGame = await game.findById(gm._id);
  // if (dbGame.result !== gm.result && dbGame.blackResult !== gm.blackResult) {
  gm.sender = sender;
  router.event.emit("gameFinished", gm);
  // }
}

async function updateMoveTimes(gm) {
  // let gm2 = addParamsToGame(gm);
  // if(gm.whiteRemainingTime >)

  gm.whiteRemainingTime =
    gm.primeryTime - setTimeConsumT(gm, "w") + gm.whiteExtraTime;
  gm.blackRemainingTime =
    gm.primeryTime - setTimeConsumT(gm, "b") + gm.blackExtraTime;
  // gm.whiteRemainingTime = gm.whiteRemainingTime - setTimeConsumT(gm, 'w');
  // gm.blackRemainingTime = gm.blackRemainingTime - setTimeConsumT(gm, 'b');
  // if (!gm.blackResult && !gm.result && gm.blackRemainingTime > 0 && gm.whiteRemainingTime > 0) {
  //     setTimer(gm, gm2.sideToMove.side)
  // }
  if (gm.whiteRemainingTime < 0) {
    // gm.result = '0-1';
    gm.whiteResult = 0;
    gm.blackResult = 1;
    await updateRating(gm);
    // setForEndGame(gm,'updateMoveTimes')
  }
  if (gm.blackRemainingTime < 0) {
    gm.whiteResult = 1;
    gm.blackResult = 0;
    await updateRating(gm);
    // setForEndGame(gm,'updateMoveTimes')
  }
}

function removeTimer(game) {
  // let interval = gameInterVals.find((interObj) => {
  //     return interObj.gameId.toString() == game._id.toString()
  // });
  // if (interval) {
  //     clearTimeout(interval.interval);
  //     gameInterVals = gameInterVals.filter((interObj) => {
  //         return interObj.gameId.toString() != game._id.toString()
  //     });
  // }
}

function setTimer(game, side) {
  // removeTimer(game);
  // let time = 0;
  // if (side == 'w') {
  //     time = game.whiteRemainingTime;
  // } else {
  //     time = game.blackRemainingTime;
  // }
  // let gameIntervalObj = {
  //     gameId: game._id,
  //     interval: setTimeout(function () {
  //        await router.io.getGameData(game._id);
  //     }, time)
  // }
  // gameInterVals.push(gameIntervalObj);
}

function setTimeConsumT(gm, side) {
  let gm2 = addParamsToGame(gm);
  if (gm2.tournamentType == "friendly" && gm2.firstMove.isFirstMove) return 0;
  let times = gm.moveDurations.trim().split(" ");

  //
  if (times.length == 1) {
    if (!times[0]) times = [];
  }
  let turn = times.length % 2 == 0 ? "w" : "b";
  let consumT = 0;
  let startIndex = side == "w" ? 0 : 1;
  for (let index = startIndex; index < times.length; index += 2) {
    let num = Number(times[index]);

    if (num) consumT += num;
    if (gm.timeIncresment) consumT = consumT - gm.timeIncresment * 1000;
  }
  if (gm.lastMoveTime == 0) gm.lastMoveTime = gm.acceptedTime;
  if (turn == side) {
    consumT += Date.now() - gm.lastMoveTime;
  }
  return consumT;
}

async function updateRating(gm) {
  if (!gm.rated) return;
  let white = gm.whiteUserName;
  white = await user.findOne({ userName: white });
  let black = gm.blackUserName;
  black = await user.findOne({ userName: black });
  let timeControllType = ut.gameTimeControll(gm);
  white[timeControllType] += calculateRatingChange(
    white[timeControllType],
    black[timeControllType],
    gm.whiteResult
  );

  black[timeControllType] += calculateRatingChange(
    black[timeControllType],
    white[timeControllType],
    gm.blackResult
  );

  white.save();
  black.save();
}

function calculateRatingChange(preSelfRate, preOppRate, result) {
  let logar = (preSelfRate - preOppRate) / 400;
  let chance = 1 / (1 + 10 ** logar);
  chance = 1 - chance;
  let newRate = 20 * (result - chance);
  if (newRate < 1) {
    switch (result) {
      case 0:
        newRate--;
        break;
      case 1:
        newRate++;
        break;
      default:
        break;
    }
  }
  return Math.round(newRate);
}
