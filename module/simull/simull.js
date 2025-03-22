const ut = require('../utility');
const gameRoot = require('../../rout/game');
const userRoot = require('../../rout/user');
const mongoose = require('mongoose');
const simullSchema = new mongoose.Schema({
    name: String,
    creatorUserName: String,
    registerTime: Number,
    color: String,
    clockTime: { type: Number, default: 60 }, // in seconds
    clockIncrement: { type: Number, default: 0 }, // in seconds
    clockExtra: { type: Number, default: 0 }, //in seconds
    // players: { type: [String], default: ['behrang', 'beh', 'beh2', 'beh3'] },
    status: { type: String, enum: ['finished', 'closed', 'open'], default: 'open' },
    players: {
        type: [String],
        default: []
    },
    games: {
        type: [String],
        default: []
    },
    // players: { type: [String], },
});
const Simull = mongoose.model('Simull', simullSchema);
Simull.api = {};

Simull.api.creat = async function (simull) {

    simull.registerTime = Date.now();
    let dbSimull = new Simull(simull);
    let newSimull = await dbSimull.save();
    return newSimull
};

Simull.api.get = async function (id) {
    let simulls = await Simull.findById(id)
    // to do add not in players
    return simulls
};
Simull.api.myGames = async function (userName) {
    let simulls = await Simull.find({ status: { $ne: 'finished' } }).or([{ creatorUserName: userName }, { players: { $in: [userName] } }])
    // to do add not in players
    return simulls
};
Simull.api.available = async function (userName) {
    let simulls = await Simull.find({ status: 'open' }).and({ creatorUserName: { $ne: userName } })
    let newSimuls = [];
    simulls.forEach(sim => {
        if (!sim.players.includes(userName)) {
            newSimuls.push(sim)
        }
    });
    // to do add not in players
    return newSimuls
};
Simull.api.join = async function (userName, simId) {
    let simull = await Simull.findOne({ status: 'open', _id: simId })
    if (!simull.players.includes(userName)) {
        // simull.players.push(userName)
        // await simull.update()
        // let up = await simull.updateOne({ _id: simId }, { $push: { players: userName } })
        let up = await Simull.updateOne({ _id: simId }, { $push: { players: userName } });
        return true
    }
    return false;
    // return simulls
};
Simull.api.withdraw = async function (userName, simId) {
    let simull = await Simull.findOne({ status: 'open', _id: simId })
    if (simull.players.includes(userName)) {
        let up = await Simull.updateOne({ _id: simId }, { $pull: { players: userName } });
        return true
    }
    return false;
    // return simulls
};
Simull.api.start = async function (userName, simId) {
    let simull = await Simull.findOne({ status: 'open', _id: simId, creatorUserName: userName })
    if (simull) {
        // let creator = await userRoot.io.getUserPublicData(simull.creatorUserName);
        let boardNo = 1;
        simull.players.forEach(async (p) => {
            let game = await creatG(p, simull, boardNo);
            await Simull.updateOne({ _id: simId }, { $push: { games: game._id } })
            boardNo++;
        });
        simull.status = 'closed';
        await Simull.updateOne({ _id: simId }, { status: 'closed' })
        return true
    }
    return false;
};
gameRoot.event.on('gameFinished', async (game) => {
    if (game.tournamentType == 'simull') {
        let gms = await gameRoot.api.getTournamentGames(game.tournamentId);
        let allFinished = false;
        for (let i = 0; i < gms.length; i++) {
            const gm = gms[i];
            if (!gm.blackResult) {
                allFinished = false;
                break;
            }
            allFinished = true;
        }
        if (allFinished) {
            let simull = await Simull.updateOne({ status: 'closed', _id: game.tournamentId }, { status: 'finished' });
            console.log('finished', gms.length, simull);
        }
        // to do 
        // select all games in tournament 
        /// 

        // let tour = await swiss.getTournamentById(game.tournamentId);
        // await pairOneTour(tour);
    }

})
async function creatG(p, simull, boardNo) {
    // let opp = await userRoot.io.getUserPublicData(p);
    let newGame = {};
    newGame.blackRemainingTime = newGame.whiteRemainingTime = newGame.primeryTime = simull.clockTime * 1000;
    newGame.rated = false;
    if (simull.color == 'w') {
        newGame.whiteUserName = simull.creatorUserName;
        newGame.blackUserName = p;
        newGame.whiteExtraTime = simull.clockExtra * 1000;
    } else {
        newGame.whiteUserName = p;
        newGame.blackUserName = simull.creatorUserName;
        newGame.blackExtraTime = simull.clockExtra * 1000;
    }
    newGame.gameTimeMins = parseInt(simull.clockTime / 60);
    newGame.gameTimeSecs = simull.clockTime % 60;
    newGame.timeIncresment = simull.clockIncrement;
    let now = Date.now();
    // if (tour.round == 0) {
    //     if (tour.startTime > now) {
    //         newGame.acceptedTime = tour.startTime;
    //     } else {
    newGame.acceptedTime = now + 1000;
    //     }
    // } else {
    //     newGame.acceptedTime = now + tour.restTime * 60 * 1000; // now + delay time
    // }

    // let remainingtime = newGame.gameTimeMins * 60;
    // remainingtime += newGame.gameTimeSecs;
    // remainingtime *= 1000;
    // newGame.blackRemainingTime = newGame.whiteRemainingTime = newGame.primeryTime = remainingtime;

    newGame.tournamentType = 'simull';
    newGame.tournamentId = simull.id;
    // newGame.tournamentRound = p1.gameIds.length + 1;
    newGame.boardNo = boardNo;
    newGame = await gameRoot.api.create(newGame);
    return newGame;
}


module.exports = Simull.api;