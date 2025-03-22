

// const Swiss = require('./swiss');
const swissPlayer = require('./module/swiss/swissPlayers')
// const userRoot = require('../../rout/user');
// // const pairPlayers = require('./pairPlayers')
// const gameRoot = require('../../rout/game');
// // const { pair } = require('./pairPlayers');
// // const { players } = require('./data');
// const util = require('util');
// const { time } = require('console');
// const { runInThisContext } = require('vm');
console.log('okkk',);
swissPlayer.find({ _id: '61af5a44d6e0764c1842c7ed' }).then((playersAll) => {
    playersAll.forEach(async p => {
        for (let i = 0; i < p.gameIds.length; i++) {
            const gId = p.gameIds[i];
            if (gId == '-') {
                p.results[i] = (1);
            } else {
                let gm = await gameRoot.io.getGameData(gId);
                if (gm.blackUserName == p.userName) {
                    p.results[i] = gm.blackResult;
                } else {
                    p.results[i] = (gm.whiteResult);
                }

            }
        }
        p.markModified('results')
        await p.save();
    });
});