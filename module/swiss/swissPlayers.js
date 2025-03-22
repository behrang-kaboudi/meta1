const mongoose = require('mongoose');
const swissPlayersSchema = new mongoose.Schema({
    tournamentId: String,
    userName: String,
    rating: Number,
    title: String,
    opponents: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    results: { type: [Number], default: [] },
    gameIds: { type: [String], default: [] },
    blackList: { type: [String], default: [] },
});
const SwissPlayers = mongoose.model('SwissPlayers', swissPlayersSchema);
/**
 * put uniq player In db for tournament
 *
 * @param {plObj} playerObj simple player Data.
 */
SwissPlayers.putInDb = async function (playerObj) {
    let player = await SwissPlayers.findOne({ userName: playerObj.userName, tournamentId: playerObj.tournamentId })
    if (!player) {
        player = new SwissPlayers(playerObj);
        await player.save();
    }
}
SwissPlayers.getPlayersInTour = async function (tourId) {
    let players = await SwissPlayers.find({ tournamentId: tourId })
    return players;
}
SwissPlayers.getPoints = (player) => {
    let points = 0;
    player.results.forEach(element => {
        points += element;
    });
    return points;
}
SwissPlayers.getOpponentPoints = (player, playerList) => {
    let points = [];
    player.opponents.forEach(oppName => {
        if (oppName == 'by') {
            points.push(0);
            return;
        }
        let oppObj = playerList.find((p) => {
            return (p.userName == oppName);
        })
        if (!oppObj) {
            return
        }
        points.push(SwissPlayers.getPoints(oppObj));
    });
    return points;
}
SwissPlayers.getBuchholz = (player, playerList, n) => {
    let oppPoints = SwissPlayers.getOpponentPoints(player, playerList);
    oppPoints.sort();
    oppPoints.reverse();
    for (let i = 0; i < player.length - n - 1; i++) {
        oppPoints.pop();
    }
    let sum = 0;
    oppPoints.forEach(p => {
        sum += p;
    });
    player['buc' + n] = sum;
    return sum;
}

SwissPlayers.sortByPoints = (player4) => {
    player4.sort(function (p1, p2) {
        return SwissPlayers.getPoints(p2) - SwissPlayers.getPoints(p1);
    })
}
SwissPlayers.sortByBuchholz = (playerList, n) => {
    playerList.sort(function (p1, p2) {
        return SwissPlayers.getBuchholz(p2, playerList, n) - SwissPlayers.getBuchholz(p1, playerList, n);
    })
}
SwissPlayers.sortByTitle = (playerList) => {
    function getValueOfTitle(title) {
        switch (title) {
            case 'GM':
                return 80;
            case 'IM':
                return 70;
            case 'WGM':
                return 60;
            case 'FM':
                return 50;
            case 'WIM':
                return 40;
            case 'CM':
                return 30;
            case 'WFM':
                return 20;
            case 'WCM':
                return 10;
            default:
                return 0;
        }
    }
    playerList.sort(function (p1, p2) {
        return getValueOfTitle(p2.title) - getValueOfTitle(p1.title);
    })
}
SwissPlayers.sortByRating = (playerList) => {
    playerList.sort(function (p1, p2) {
        return p2.rating - p1.rating;
    })
}
SwissPlayers.sortByName = (playerList) => {
    playerList.sort(function (p1, p2) {
        return p1.userName.toLowerCase().localeCompare(p2.userName.toLowerCase())
    })
}
module.exports = SwissPlayers;