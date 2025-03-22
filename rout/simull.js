// const express = require('express');
const { express, io } = require('./mainRout');
const simullApi = require('../module/simull/simull');
const gameRout = require('./game')
const config = require('config');
const rout = express.Router();
rout.get('/main/', (req, res) => {
    if (!req.user.login) {
        res.redirect('/user/login');
    }
    res.render(config.get('template') + '/page/game/simull/simull', {
        user: req.user
    });
});
rout.get('/new/', (req, res) => {
    if (!req.user.login) {
        res.redirect('/user/login');
    }

    res.render(config.get('template') + '/page/game/simull/new', {
        user: req.user
    });
});
rout.get('/game/:simullId', async (req, res) => {
    simullApi.get(req.params.simullId).then(async (sim) => {
        let game = await gameRout.api.getSimullGame(sim, req.user);
        var fullUrl = req.protocol + '://' + 'metachessmind.com' + '/game/play/' + game._id;
        res.redirect(fullUrl);
        // res.redirect('http://localhost:3000/simul'/game/play/' + game._id);


    })
    // = async function (simull) {
    //     co
    // if (!req.user.login) {
    //     res.redirect('/user/login');
    // }

    // res.render(config.get('template') + '/page/game/simull/new', {
    //     user: req.user
    // });
});
rout.get('/hall/:id', (req, res) => {
    simullApi.get(req.params.id).then(sim => {

        gameRout.io.getGameData({ _id: sim.games[0] }).then(gm => {
            if (gm) {
                res.render(config.get('template') + '/page/game/play/play', {
                    user: req.user,
                    gameId: req.params.id.trim(),
                    game: JSON.stringify(gm),
                    simull: sim
                });
            } else {
                res.redirect('/');
            }
        });
    })

});


rout.io = {}
rout.ioF = async function (data, ack, userData) {
    if (!data) return;
    await rout.io[data.signal](data.data, ack, userData);
}
rout.io.next = async function (data, ack, userData) {
    let simul = await simullApi.get(data.id);
    for (let i = 0; i < simul.games.length; i++) {
        const gmId = simul.games[i];
        let game = await gameRout.io.getGameData(gmId);
        if(!game.blackResult && !game.whiteResult){
            let prop = game.sideToMove.side == 'b' ?'black':'white';
            prop += 'UserName';
            if(game[prop] == simul.creatorUserName)
            {
                ack(game);
                return;
            }
            
        }
        
    }
    ack(false);
}
rout.io.creatSimull = function (simullData, userData) {

    simullData.creatorUserName = userData.userName;
    simullData.clockTime = simullData.clockTime * 60;
    simullData.clockExtra = simullData.clockExtra * 60;
    simullApi.creat(simullData);

}
rout.io.myGames = async function (userData) {
    return await simullApi.myGames(userData.userName);
}
rout.io.available = async function (userData) {
    return await simullApi.available(userData.userName);
}
rout.io.join = async function (userData, simullData) {
    return await simullApi.join(userData.userName, simullData.id);
}
rout.io.withdraw = async function (userData, simullData) {
    return await simullApi.withdraw(userData.userName, simullData.id);
}
rout.io.start = async function (userData, simullData) {
    return await simullApi.start(userData.userName, simullData.id);
}
module.exports = rout;