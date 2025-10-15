const ut = require('../utility');
const swPlayer = require('./swissPlayers');


pairPlayers = {};
firstRd = {
    setFirstRoundColor: function (players) {
        for (let i = 0; i < players.length; i++) {
            i % 2 == 0 ? players[i].colors[0] = 'w' : players[i].colors[0] = 'b';
        }
        if (players.length % 2 == 1){
            players[players.length - 1].colors[0] = 'by';
        } 
    },
    pairFirstRound: async function (players) {
        firstRd.setFirstRoundColor(players);
        for (let i = 0; i < players.length; i++) {
            if (players[i].opponents.length == 1) continue;
            firstRd.setFirsRounOpp(players[i], players);
        }
    },
    setFirsRounOpp: function (player, players) {
        if (player.colors[0] == 'by') {
            player.opponents[0]= 'by';
            return;
        }
        let opp = getCanPairOpponent(player, players);
        player.opponents[0] = opp[0].userName;
        opp[0].opponents[0] = player.userName;

    },

};

pairPlayers.pair = async function (players, tour) {
    if (tour.maxRound <= tour.round) {
        return false;
    }
    pairPlayers.sortForPairing(players);
    if (tour.round == 0) {
        await firstRd.pairFirstRound(players);
        return true;
    }
    else {

    }
    // game.creatGames(players, tour);
    // console.log('', players);

    // for (let i = 0; i < mainPlayerList.length; i++) {
    //     if (mainPlayerList[i].opponents.length == tour.round + 1) continue;

    //     let blackListCounter = mainPlayerList[i].opponents.length + 1;
    //     if ('blackList' in mainPlayerList[i]) {
    //         blackListCounter += mainPlayerList[i].blackList.length;
    //     }
    //     let opponentsCount = mainPlayerList.length % 2 == 0 ? mainPlayerList.length : mainPlayerList.length;
    //     if (blackListCounter == opponentsCount) {
    //         if (i == 0) {
    //             return false;
    //         }
    //         --i;
    //         disPatchOpponents(mainPlayerList[i], mainPlayerList);
    //         i = -1;
    //         continue;
    //     }
    //     // console.log('findOpponent', mainPlayerList[i], i, mainPlayerList);
    //     let found = findOpponent(mainPlayerList[i]);
    //     if (!found) {
    //         if (i == 0) {
    //             return false;
    //         }
    //         --i;
    //         disPatchOpponents(mainPlayerList[i], mainPlayerList);
    //         i = -1;
    //         continue;
    //     }
    // }
    // return true;
}
pairPlayers.sortForPairing = function (players) {
    primerySort(players);
    swPlayer.sortByPoints(players);
}
function primerySort(players) {
    swPlayer.sortByName(players);
    swPlayer.sortByTitle(players);
    swPlayer.sortByRating(players);
}

function getCanPairOpponent(player, players, condition = { color: true }) {
    let oppList = players.filter(p => (p.userName != player.userName) && (p.opponents.length == player.opponents.length) &&
        (!player.opponents.includes(p.userName)) && (!player.blackList.includes(p.userName)))
    if (condition.color) {
        oppList = filterOpponentsForColor(player, oppList)
    }


    // to do re order Opponents
    return oppList;
}
function filterOpponentsForColor(player, opponents) {
    if (player.opponents.length < 1) {
        let oppList = opponents.filter(p => (p.colors[0] != player.colors[0]))
        return oppList
    }
}
function setGamse(players) {

}



module.exports = pairPlayers;