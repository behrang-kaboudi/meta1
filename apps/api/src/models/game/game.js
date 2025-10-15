const { number } = require('joi');
const mongoose = require('mongoose');
const gameSchema = new mongoose.Schema({
    inputComments: String, // for Tournament Names And ........
    blackUserName: String,
    whiteUserName: String,
    blackRate: String,
    whiteRate: String,
    blackResult: { type: Number, default: null },
    whiteResult: { type: Number, default: null },

    gameTimeMins: Number,
    gameTimeSecs: Number,
    timeIncresment: { type: Number, default: 0 },
    acceptedTime: Number,
    blackRemainingTime: Number,
    whiteRemainingTime: Number,
    primeryTime: Number,
    blackExtraTime: { type: Number, default: 0 },
    whiteExtraTime: { type: Number, default: 0 },
    // whiteLastMoveTime: {type: Number, default: 0},
    //
    // whiteTimeConsum: {type: Number, default: 0},
    lastMoveTime: { type: Number, default: 0 },
    moveDurations: { type: String, default: '' },
    startPosition: {
        type: String,
        default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    },
    rated: Boolean,
    pgn: { type: String, default: '' },
    result: { type: String, default: '', enum: ['abort', 'finished', '', 'mate', 'flaged', 'resign', 'offer'] },
    tournamentType: { type: String, default: 'friendly' },
    tournamentId: { type: String, default: null },
    tournamentRound: { type: Number, default: null },
    boardNo: { type: Number, default: null },
    chats: { type: [String], default: [] },
    offerDrawBy: { type: String, default: null }, // setUserName
    inUse: { type: Boolean, default: false }
    // tournamentType: { type: String, default: 'swiss' },
    // gameDelay: { type: Number, default: 0 } // seconds
});
const Game = mongoose.model('Game', gameSchema);

// Game.getFromLink = async function (link) {
//   let dbUser = await Game.findOne ({link: link});
//   return dbUser;
// };
Game.timeToStart = 25; //second
Game.createNew = async function (game) {
    let dbGame = new Game(game);
    return await dbGame.save();
};
Game.hasTime = function (game) {
    let elapsed = Date.now() - game.acceptedTime;
    let moves = game.pgn.split('--').filter((m) => m);

    if (game.tournamentType == 'friendly') {
        if (moves.length == 0 && elapsed > Game.timeToStart * 1000 || moves.length == 1 && elapsed > 2 * Game.timeToStart * 1000) {
            game.result = 'abort';
            game.save();
            return false
        }
    }


    let gameTime = (game.primeryTime * 2) + moves.length * game.timeIncresment * 1000 + 2 * Game.timeToStart * 1000 + 1000;
    if (elapsed > gameTime) {
        return false;
    }
    return true;
}
Game.getLiveGames = async function (userName = null) {
    let games = [];
    if (!userName) {
        games = await Game.find({ whiteResult: null, result: '' });
    } else {
        games = await Game.find({ whiteResult: null, result: '' }).or([{ blackUserName: userName }, { whiteUserName: userName }]);
    }
    // console.log(games.length);

    let sendGames = [];
    for (let i = 0; i < games.length; i++) {
        if (Game.hasTime(games[i]))
            sendGames.push(games[i]);
    }
    return sendGames;
};


module.exports = Game;