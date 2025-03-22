const express = require('express');
const puzzle = require('../module/puzzle/puzzle');
const ut = require('../module/utility');
const { Chess } = require('chess.js');
const config = require('config');
const userRout = require('./user');
const solvedPuzzle = require('../module/puzzle/solved');
const { putPuzzlesInDb } = require('../module/puzzle/puzzle');
const rout = express.Router();
const primeryDelayTime = 25;
rout.get('/training/', (req, res) => {
    // todo if login
    // chalenge.findOne({ _id: req.params.id, status: 'waiting' }).then(ch => {
    //     if (ch) {
    //         ch = ut.copyObj(ch);
    //         ch.gameTimeControll = ut.gameTimeControll(ch);
    //         res.render(config.get('template') + '/page/game/chalenge', {
    //             user: req.user,
    //             chalenge: ch,
    //         });
    //     } else {
    //         res.redirect('/');
    //     }
    // });
    if (!req.user.login) {
        res.redirect('/user/login');
    }

    res.render(config.get('template') + '/page/puzzle/training', {
        user: req.user
    });
});
rout.putPuzzlesInDb = function(fileName) {
    puzzle.putPuzzlesInDb(fileName)
}


rout.io = {};
rout.io.getNewPuzzle = async function(userName) {

    let solved = await solvedPuzzle.getSolvedPuzzles(userName);
    if (!solved) {
        solved = { den: [] };
    }

    return puzzle.getNewPuzzle(solved.fen);
};
rout.io.updateAnswer = async function(data) {

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

module.exports = rout;