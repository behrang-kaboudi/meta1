let swPlayer = require('./swissPlayers');

// let mainPlayerList = pairingData.players;
// let tour = pairingData.tour;
let mainPlayerList;
let tour;
pairing = {};
pairing.pairingData = require('./data');
pairing.standings = function (playersList) {
    // pairTour();
    // pairingData.setRandomResult(mainPlayerList, 1);
    // tour.round += 1;
    // pairTour();
    // pairingData.setRandomResult(mainPlayerList, 2);
    // tour.round += 1;
    // pairTour();
    // pairingData.setRandomResult(mainPlayerList, 3);
    // console.log(pairingData.players);
    swPlayer.sortByBuchholz(playersList, 1);
    swPlayer.sortByPoints(playersList);
    return playersList;
}
/**
 * change playersList, tour obj
 *
 * @param {Array} playersList.
 * @param {obj} tour .
 * @return {boolean}  false for tournament end true if paird.
 */
pairing.pair = function (playersList, tournoment) {
    mainPlayerList = playersList
    tour = tournoment;
    // pseudo: if max round finish tour nament
    if (tour.maxRound <= tour.round) {
        return false;
    }
    let paired = pairTour();
    console.log('', playersList);
    // pairTourAnyWay(); // if (!paired)  paired = 
    return paired;
}

function sortForPairing(playersList) {
    primerySort(playersList);
    swPlayer.sortByPoints(playersList);
}
/**
 * sort for First Round
 */
function primerySort(playersList) {
    swPlayer.sortByName(playersList);
    swPlayer.sortByTitle(playersList);
    swPlayer.sortByRating(playersList);
}



/// new
function listToStr(playerList) {
    let str = "";
    playerList.forEach(pl => {
        str += tostr(pl) + '\n'
    });
    return str;
}

function tostr(pl) {
    let str = '';
    str += ` -- ${pl.userName} colors : ${JSON.stringify(pl.colors)} opponents:${JSON.stringify(pl.opponents)} blackList : ${JSON.stringify(pl.blackList)}`
    return str
}



function pairTour() {
    sortForPairing(mainPlayerList);

    if (tour.round == 0) {
        pairFirstRound(mainPlayerList);
        return true;
    }
    for (let i = 0; i < mainPlayerList.length; i++) {
        if (mainPlayerList[i].opponents.length == tour.round + 1) continue;

        let blackListCounter = mainPlayerList[i].opponents.length + 1;
        if ('blackList' in mainPlayerList[i]) {
            blackListCounter += mainPlayerList[i].blackList.length;
        }
        let opponentsCount = mainPlayerList.length % 2 == 0 ? mainPlayerList.length : mainPlayerList.length;
        if (blackListCounter == opponentsCount) {
            if (i == 0) {
                return false;
            }
            --i;
            disPatchOpponents(mainPlayerList[i], mainPlayerList);
            i = -1;
            continue;
        }
        // console.log('findOpponent', mainPlayerList[i], i, mainPlayerList);
        let found = findOpponent(mainPlayerList[i]);
        if (!found) {
            if (i == 0) {
                return false;
            }
            --i;
            disPatchOpponents(mainPlayerList[i], mainPlayerList);
            i = -1;
            continue;
        }
    }
    return true;
}


function disPatchOpponents(player, playersList) {
    // console.log('dsdsdsdsdsd', listToStr(playersList));
    if (player.opponents.length == player.results.length) {
        return;
    }
    let oppUserName = player.opponents[player.opponents.length - 1];
    player.colors.pop();
    player.opponents.pop();
    let haveBlackList = 'blackList' in player;
    if (!haveBlackList) player.blackList = [];
    if (!player.blackList.includes(oppUserName)) {
        player.blackList.push(oppUserName);
    }
    if (oppUserName == 'by') return;
    let opp = playersList.find(p => p.userName == oppUserName)
    opp.colors.pop();
    opp.opponents.pop();
    haveBlackList = 'blackList' in opp;
    if (!haveBlackList) opp.blackList = [];
    if (!opp.blackList.includes(player.userName)) {
        opp.blackList.push(player.userName);
    }
    // remove smaller black list
    let index = playersList.findIndex(p => p.userName == player.userName);
    // console.log('index', index);
    for (let i = index + 1; i < playersList.length; i++) {
        const player = playersList[i];
        if ('blackList' in player) {
            player.blackList = [];
        }
    }
}

function pairFirstRound() {
    setFirstRoundColor();
    for (let i = 0; i < mainPlayerList.length; i++) {
        if (mainPlayerList[i].opponents.length == 1) continue;
        findFirsRounOpp(mainPlayerList[i]);
    }

}

function setFirstRoundColor() {

    for (let i = 0; i < mainPlayerList.length; i++) {
        i % 2 == 0 ? mainPlayerList[i].colors.push('w') : mainPlayerList[i].colors.push('b');
    }
    if (mainPlayerList.length % 2 == 1) mainPlayerList[mainPlayerList.length - 1].colors[0] = '-'
}

function findFirsRounOpp(player) {
    if (mainPlayerList.length % 2 == 1 && mainPlayerList[mainPlayerList.length - 1].userName == player.userName) {
        player.opponents.push('by');
        return;
    }

    let oppList = getCanPairOpponents(player, mainPlayerList);
    orderOpponents(player, oppList);
    for (let i = 0; i < oppList.length; i++) {
        const oppCandidate = oppList[i];
        if (oppCandidate.colors[0] != player.colors[0]) {
            player.opponents.push(oppCandidate.userName);
            oppCandidate.opponents.push(player.userName);
            return;
        }
    }
    // console.log('1', player, oppList, );
}



function findOpponent(player) {
    let preRdNum = player.results.length;
    if (player.opponents.length > preRdNum) return true;
    let preferdColor = getPreferdColor(player);


    let canPairList = getCanPairOpponents(player, mainPlayerList);
    canPairList = orderOpponents(player, canPairList);
    let found = false;
    let sameGroup = getSameScoreGroupPlayers(player, canPairList);


    found = setOpponentPrefer(player, sameGroup, preferdColor);
    // console.log(player.userName + '-' + 'preferdColor:' + preferdColor + found, listToStr(sameGroup));
    if (found) return true;

    found = setOpponentAlowable(player, sameGroup, preferdColor);
    // console.log(player.userName + '-' + 'preferdColor:' + preferdColor + found, listToStr(sameGroup));
    if (found) return true;

    let allowableColor = getAllowableColor(player);
    found = setOpponentPrefer(player, canPairList, allowableColor);
    // console.log(player.userName + '-' + 'preferdColor:' + allowableColor + found, listToStr(canPairList));
    if (found) return true;

    found = setOpponentAlowable(player, canPairList, allowableColor);
    // console.log(player.userName + '-' + 'preferdColor:' + allowableColor + found, listToStr(canPairList));
    if (found) return true;
    found = setBy(player);
    // console.log(player.userName + '-' + preferdColor + '===>' + pairingData.getNames(canPairList));
    return found;

}

function setOpponentAnyWay(player, oppGroup, selfColor) {
    for (let i = 0; i < oppGroup.length; i++) {
        const opp = oppGroup[i];
        let oppPreferdColor = getPreferdColor(opp);
        if (selfColor != oppPreferdColor) {
            pairTowPlayers(player, selfColor, opp, oppPreferdColor);
            return true;
        }
    }
    return false;
}

function setBy(player) {
    // todo active players odd no by
    if ('blackList' in player) {
        if (player.blackList.includes('by')) {
            return;
        }
    }
    if (mainPlayerList.length % 2 == 0) return false;
    if (player.opponents.includes('by')) return false;
    for (let i = 0; i < mainPlayerList.length; i++) {
        const p = mainPlayerList[i];
        if (p.opponents.length == tour.round + 1) {
            if (p.opponents[tour.round] == 'by') {
                return false;
            }
        }
    }
    player.opponents.push('by');
    player.colors.push('-');
    return true;
}

function setOpponentPrefer(player, oppGroup, selfColor) {
    for (let i = 0; i < oppGroup.length; i++) {
        const opp = oppGroup[i];
        let oppPreferdColor = getPreferdColor(opp);
        if (selfColor != oppPreferdColor) {
            pairTowPlayers(player, selfColor, opp, oppPreferdColor);
            return true;
        }
    }
    return false;
}

function setOpponentAlowable(player, group, selfColor) {
    for (let i = 0; i < group.length; i++) {
        let oppPreferdColor = getAllowableColor(group[i])
        if (!oppPreferdColor) continue;
        if (selfColor != oppPreferdColor) {
            pairTowPlayers(player, selfColor, group[i], oppPreferdColor);
            return true;
        }
    }
    return false;
}

function getAllowableColor(player) {

    if (tour.round == 1) {
        let color = getFirstRoundColor(player);
        return color == 'w' ? 'w' : 'b';
    }
    if (player.colors[tour.round - 1] == '-') {
        return player.colors[tour.round - 2]
    }
    if (tour.round == tour.maxRound - 1) {
        return player.colors[tour.round - 1]
    }
    if (player.colors[tour.round - 1] == player.colors[tour.round - 2]) return false;
    return player.colors[tour.round - 1];
}



function getSameScoreGroupPlayers(player, canPairList) {
    let samePointsNum = getSamePointOpNum(player, canPairList);
    if (samePointsNum % 2 == 0) samePointsNum++;
    let sameGroup = [];
    sameGroup = canPairList.slice(0, samePointsNum);
    return sameGroup;
}

function pairTowPlayers(p1, p1Color, p2, p2Color) {
    p1.colors.push(p1Color);
    p2.colors.push(p2Color);
    p1.opponents.push(p2.userName);
    p2.opponents.push(p1.userName);
}

function getCanPairOpponents(player, oppList) {
    let pls = [];
    let length = player.opponents.length;
    for (let i = 0; i < oppList.length; i++) {

        const opp = oppList[i];
        if (length != opp.opponents.length) continue;

        if (player.userName == opp.userName || player.opponents.includes(opp.userName)) continue;
        if ('blackList' in player) {
            if (player.blackList.includes(opp.userName)) continue;
        }
        pls.push(opp);
    }
    return pls
}

function getPreferdColor(player) {
    let round = tour.round;
    if (round == 0) {
        return setFirstRoundColor(player, mainPlayerList);
    }
    let preColor = player.colors[round - 1];
    if (player.opponents[round - 1] == 'by') {
        if (round == 1) {
            preColor = getFirstRoundColor(player);
        }
        if (round > 1) {
            preColor = player.colors[round - 2]
        }
    }

    return preColor == 'w' ? 'b' : 'w';
}

function getFirstRoundColor(player) {
    let players = mainPlayerList.slice();
    primerySort(players);
    let index = players.findIndex(p => player.userName == p.userName)
    if (index % 2 == 1) return 'b';
    return 'w';
}


function orderOpponents(player, playerList) {
    let preOrderList = playerList.slice();
    let samPoint = getSamePointOpNum(player, playerList);
    if (samPoint < 2) return preOrderList;
    let half = parseInt(samPoint / 2);
    let newOrder = [];
    newOrder = preOrderList.slice(half, samPoint);
    newOrder = newOrder.concat(preOrderList.slice(0, half));
    newOrder = newOrder.concat(preOrderList.slice(samPoint));
    return newOrder;

}

function getSamePointOpNum(player, playerList) {
    let sum = 0;
    let myPoint = swPlayer.getPoints(player);
    playerList.forEach(p => {
        if (p.userName == player.userName) return;
        if (swPlayer.getPoints(p) == myPoint) ++sum;
    });
    return sum;
}

module.exports = pairing;
// pairing.pair(players, tour);