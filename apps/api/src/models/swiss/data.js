let pairingData = {
    tour: {
        "_id": "61015c744e71cf8d02c41c9a",
        "maxRound": 5,
        "gameDuration": 180,
        "ext//raTime": 2,
        "res//tTime": 1,
        "pla//yers": [
            "behrang3",
            "alideh123456",
            "emad",
            "mehr2020",
            "lczro6611",
            "maryambahreini"
        ],
        "round": 0,
        "pairingMode": false,
        "status": "finished",
        "title": "چهار شنبه ساعت 6:07",
        "fee": 0,
        "startTime": 1627479420000.0,
        "regulation": "آزاد برای تمام شرکت کنندگان",
        "registerTime": 1627479156000.0,
        "__v": 6
    },
    players: [{
            "_id": "61015d684e71cf8d02c41ca2",
            "opponents": [
                // "emad",
                // "alideh123456",
                // "maryambahreini"
            ],
            "colors": [
                //"b",
                //"w",
                //"b"
            ],
            "results": [
                //1,
                //0,
                //0)
            ],
            "gameIds": [
                //// "61015d684e71cf8d02c41ca9",
                //// "61015f414e71cf8d02c41cac",
                //// "610161504e71cf8d02c41cb0"
            ],
            "userName": "behrang3",
            "tournamentId": "61015c744e71cf8d02c41c9a",
            "rating": 1377,
            "__v": 3
        }, {
            "_id": "61015d684e71cf8d02c41ca3",
            "opponents": [
                //"lczro6611",
                //"behrang3",
                //"emad"
            ],
            "colors": [
                //"b",
                //"b",
                //"w"
            ],
            "results": [
                //0,
                //1,
                //1)
            ],
            "gameIds": [
                //"61015d684e71cf8d02c41ca8",
                //"61015f414e71cf8d02c41cac",
                //"610161504e71cf8d02c41caf"
            ],
            "userName": "alideh123456",
            "tournamentId": "61015c744e71cf8d02c41c9a",
            "rating": 1407,
            "__v": 3
        },

        {
            "_id": "61015d684e71cf8d02c41ca4",
            "opponents": [
                //"behrang3",
                //"mehr2020",
                //"alideh123456"
            ],
            "colors": [
                //"w",
                //"b",
                //"b"
            ],
            "results": [
                //0,
                //0,
                //0)
            ],
            "gameIds": [
                //"61015d684e71cf8d02c41ca9",
                //"61015f414e71cf8d02c41cad",
                //"610161504e71cf8d02c41caf"
            ],
            "userName": "emad",
            "tournamentId": "61015c744e71cf8d02c41c9a",
            "rating": 1403,
            "__v": 3
        },
        {
            "_id": "61015d684e71cf8d02c41ca5",
            "opponents": [
                //"maryambahreini",
                //"emad",
                //"lczro6611"
            ],
            "colors": [
                //"w",
                //"w",
                //"b"
            ],
            "results": [
                //0,
                //1,
                //0)
            ],
            "gameIds": [
                //"61015d684e71cf8d02c41caa",
                //"61015f414e71cf8d02c41cad",
                //"610161504e71cf8d02c41cae"
            ],
            "userName": "mehr2020",
            "tournamentId": "61015c744e71cf8d02c41c9a",
            "rating": 1377,
            "__v": 3
        },

        {
            "_id": "61015d684e71cf8d02c41ca6",
            "opponents": [
                //"alideh123456",
                //"maryambahreini",
                //"mehr2020"
            ],
            "colors": [
                //"w",
                //"b",
                //"w"
            ],
            "results": [
                //1,
                //1,
                //1)
            ],
            "gameIds": [
                //"61015d684e71cf8d02c41ca8",
                //"61015f414e71cf8d02c41cab",
                //"610161504e71cf8d02c41cae"
            ],
            "userName": "lczro6611",
            "tournamentId": "61015c744e71cf8d02c41c9a",
            "rating": 1528,
            "__v": 3
        },
        {
            "_id": "61015d684e71cf8d02c41ca7",
            "opponents": [
                //"mehr2020",
                //"lczro6611",
                //"behrang3"
            ],
            "colors": [
                //"b",
                //"w",
                //"w"
            ],
            "results": [
                //1,
                //0,
                //1)
            ],
            "gameIds": [
                //"61015d684e71cf8d02c41caa",
                //"61015f414e71cf8d02c41cab",
                //"610161504e71cf8d02c41cb0"
            ],
            "userName": "maryambahreini",
            "tournamentId": "61015c744e71cf8d02c41c9a",
            "rating": 1372,
            "__v": 3
        }
    ],
    getNames: function(players) {
        let pls = [];
        players.forEach(p => {
            pls.push(p.userName + ' ' + p.rating + ' ' + p.title);
        });
        return pls;
    },
    setRandomResult: function(players, round) {

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            if (player.results.length == round) continue;
            player.results.push(1);
            let opp = player.opponents[round - 1];
            if (opp == 'by') continue;
            opp = players.find(p => {
                return p.opponents[round - 1] == player.userName
            });
            opp.results.push(0);
        }
    }
}
module.exports = pairingData;