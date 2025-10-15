const express = require("express");
const puzzle = require("../models/puzzle/puzzle");
const ut = require("../models/utility");
const { Chess } = require("chess.js");
const config = require("config");
const { router: userRout } = require("./user");
const solvedPuzzle = require("../models/puzzle/solved");
const { putPuzzlesInDb } = require("../models/puzzle/puzzle");
const { Router } = require("express");
const router = Router();
const primeryDelayTime = 25;
router.get("/training/", (req, res) => {
  if (!req.user.login) {
    res.redirect("/user/login");
  }

  res.render(config.get("template") + "/page/puzzle/training", {
    user: req.user,
  });
});
router.putPuzzlesInDb = function (fileName) {
  puzzle.putPuzzlesInDb(fileName);
};

router.io = {};
router.io.getNewPuzzle = async function (userName) {
  let solved = await solvedPuzzle.getSolvedPuzzles(userName);
  if (!solved) {
    solved = { den: [] };
  }

  return puzzle.getNewPuzzle(solved.fen);
};
router.io.updateAnswer = async function (data) {
  let result = data.answer ? 1 : 0;
  let change = calculateRatingChange(1400, data.rating, result);
  solvedPuzzle.newSolved(data);
  userRout.api.updatePuzzleRating(data.userName, change);
  return change;
};

function calculateRatingChange(preSelfRate, preOppRate, result) {
  let logar = (preSelfRate - preOppRate) / 400;
  let chance = 1 / (1 + 10 ** logar);
  chance = 1 - chance;
  let newRate = 20 * (result - chance);
  return Math.round(newRate);
}

module.exports = { path: "/puzzle/", router };
