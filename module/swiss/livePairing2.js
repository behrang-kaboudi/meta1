const swiss = require('./swiss');
const swissPlayer = require('./swissPlayers');
const pairing = require('./pairing');
const gameRoot = require('../../rout/game');
const userRoot = require('../../rout/user');
const swissRout = require('../../rout/swiss');
let livePairing = {}; // for exporting data
let timeOut = null; // to keep timer
io = null; // to send data to clients
// todo pair naghes pairings
/**
 * pair tours -set next time pairings
 */
gameRoot.event.on('gameFinished', async (game) => {
    if (game.tournamentType == 'swiss') {
        let tour = await swiss.getTournamentById(game.tournamentId);
        await pairOneTour(tour);
    }

})
// pair in 20 secs
// let pairingIntervall = setInterval(function() {
//     livePairing.livePairing();
// }, 20000);
livePairing.livePairing = async function () {
    clearTimeout(timeOut); // to not inter fere whith other callers
    let nextPairTime = await pairAllTour();
    process.env.nextSwissPairTime = nextPairTime;
    if (nextPairTime !== false) {
        // if there is any open tournament 
        timeOut = setTimeout(livePairing.livePairing, nextPairTime);
    }
}

/**
 * 
 * @return {false} no tournament.
 * @return {time}  lesser time for next pairing .
 */
async function pairAllTour() {
    let tours = await swiss.getTournamentsForPairing();
    if (tours.length == 0) return false; // if no unfinished tours
    let nextPairTime = 100000000;
    for (let i = 0; i < tours.length; i++) {
        let tp = await pairOneTour(tours[i]);
        if (tp !== false) {
            nextPairTime = nextPairTime < tp ? nextPairTime : tp;
        }
    }
    if (nextPairTime == 100000000) return false;
    return nextPairTime;
}


async function pairOneTour(tour) {
    if (tour.round == 0) {
        let t = timeToStartTour(tour);
        /// todo set paing time and 30 secs before start
        if (t > 20000) {
            return t;
        }
    } else {
        let remaining = await getUnFinishedGames(tour);
        if (remaining > 0) {
            return false
        }
    }
    let tourForPairing = await swiss.getForPairing(tour.id);
    if (tourForPairing) {
        if (tour.round == 0) {
            await putPlayersInDb(tour);
            tourForPairing.status = 'closed';
            let plCount = tourForPairing.players.length;
            if (tourForPairing.maxRound >= plCount) {
                if (plCount % 2 == 1) plCount++;
                tourForPairing.maxRound = plCount - 1
            }
        } else {
            players = await swissPlayer.getPlayersInTour(tour.id);
            await updateRoundResults(players, tour.round)
        }

        players = await swissPlayer.getPlayersInTour(tour.id);
        let pairResult = pairing.pair(players, tourForPairing);
        if (pairResult) {
            await creatGames(tourForPairing, players);
            await updatePlayers(players)
            tourForPairing.round++;
        } else {
            tourForPairing.status = 'finished';
            /// pseudo:  to do if last round fifnish tournumente 
        }

        tourForPairing.pairingMode = false;
        await tourForPairing.save();
        io.emit('getNewSwissTourData')
        // pseudo: emit tournament data
    }
    return false;
}
async function updatePlayersResult(tour) {

}
async function updatePlayers(playersList) {
    for (let i = 0; i < playersList.length; i++) {
        let pl = playersList[i];
        let p = await pl.save();
    }
}



async function creatPlayerObj(name, tourId, timeControl) {
    let dbPlayer = await userRoot.io.getUserPublicData(name); // for title and time controll rating 
    let newpl = {
        userName: name,
        tournamentId: tourId,
        rating: dbPlayer[timeControl],
        title: dbPlayer.title,
        opponents: [],
        colors: [],
        results: []
    }
    return newpl
}

function timeToStartTour(tournament) {
    let t = tournament.startTime - Date.now();
    let payment = 1; // todo
    let startTime = t - payment;
    return startTime;
}

async function getUnFinishedGames(tour) {
    let unFinished = 0;
    let games = await gameRoot.api.getTournamentRdGames(tour.id, tour.round)
    for (let i = 0; i < games.length; i++) {
        let gm = games[i];
        if (gm.blackResult || gm.result) continue;
        gm = await gameRoot.io.getGameData(gm._id);
        if (gm.result || gm.whiteResult) continue;
        unFinished++
    }
    return unFinished;
}


// async function updateAllResults(players, tour) {
//     for (let i = 0; i < tour.round; i++) {

//         await updateRoundResults(players, i + 1)
//     }
// }
async function updateRoundResults(players, round) {
    for (let i = 0; i < players.length; i++) {
        let pl = players[i];
        if (pl.results.length == round) continue;
        let gameId = pl.gameIds[round - 1];
        if (!gameId || gameId == "") {
            pl.results[round - 1] = 1;
        } else {
            let game = await gameRoot.io.getGameData(pl.gameIds[round - 1]);
            pl.results[round - 1] = pl.userName == game.whiteUserName ? game.whiteResult : game.blackResult;

        }

        let up = await swissPlayer.updateOne({ _id: pl.id }, {
            $set: {
                results: pl.results,
            }
        });
    }
}

async function creatGames(tour, players) {
    let boardNo = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].opponents[tour.round] == 'by') {
            players[i].gameIds.push('');
            continue
        }
        if (players[i].gameIds.length == tour.round) {
            let oppIndex = players.findIndex((p) => { return p.userName == players[i].opponents[tour.round] });
            boardNo++;
            await creatG(players[i], players[oppIndex], tour, boardNo);
        }
    }
}
async function creatG(p1, p2, tour, boardNo) {

    let newGame = {};
    newGame.rated = true;
    if (p1.colors[tour.round] == 'w') {
        newGame.whiteUserName = p1.userName;
        newGame.whiteRate = p1.rating;
        newGame.blackUserName = p2.userName;
        newGame.blackRate = p2.rating;
    } else {
        newGame.whiteUserName = p2.userName;
        newGame.whiteRate = p2.rating;
        newGame.blackUserName = p1.userName;
        newGame.blackRate = p1.rating;
    }
    newGame.gameTimeMins = parseInt(tour.gameDuration / 60);
    newGame.gameTimeSecs = tour.gameDuration % 60;
    newGame.timeIncresment = tour.extraTime;
    let now = Date.now();
    if (tour.round == 0) {
        if (tour.startTime > now) {
            newGame.acceptedTime = tour.startTime;
        } else {
            newGame.acceptedTime = now + 1000;
        }
    } else {
        newGame.acceptedTime = now + tour.restTime * 60 * 1000; // now + delay time
    }

    let remainingtime = newGame.gameTimeMins * 60;
    remainingtime += newGame.gameTimeSecs;
    remainingtime *= 1000;
    newGame.blackRemainingTime = newGame.whiteRemainingTime = newGame.primeryTime = remainingtime;

    newGame.tournamentType = 'swiss';
    newGame.tournamentId = tour.id;
    newGame.tournamentRound = p1.gameIds.length + 1;
    newGame.boardNo = boardNo;
    newGame = await gameRoot.api.create(newGame);
    p1.gameIds.push(newGame.id);
    p2.gameIds.push(newGame.id);
    io.emit('swissGameCreat', newGame);
    return newGame;
}



module.exports.livePairing = function (ioObj) {
    io = ioObj;
    livePairing.livePairing();
    livePairing.getUnFinishedGames = getUnFinishedGames;
    return livePairing;
};
module.exports.funcs = { getUnFinishedGames }