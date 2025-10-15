const ut = require('../utility');
const Events = require('events');
const { io } = require('../../rout/mainRout')
const fs = require('fs');
const { spawn } = require('child_process');
const Swiss = require('./swiss');
const swissPlayer = require('./swissPlayers');
const userRoot = require('../../rout/user');
// const pairPlayers = require('./pairPlayers')
const gameRoot = require('../../rout/game');
// const { pair } = require('./pairPlayers');
// const { players } = require('./data');
const util = require('util');
const myFs={};
myFs.writeFile =  util.promisify(fs.writeFile);
myFs.readFile =  util.promisify(fs.readFile);
Swiss.updateMany({$or:[{status:'open'},{status:'closed'}]},{inUse:false}).then(function () {
    // console.log('ok',);
}) ;
// pair in 20 secs
setInterval(async function() {
    // todo clear interval and then start it after all
    let tours = await Swiss.find({ status: { $ne: 'finished' } }, { inUse: false });
    if (tours.length == 0) return false; // if no unfinished tours
    for (let i = 0; i < tours.length; i++) {
        let tr = await pairing.getPairingObj(tours[i].id)
        if (tr) {
           await tr.pair();
           await tr.dispose();
        }
    }
}, 10000);
gameRoot.event.on('gameFinished',async function (data) {
    if(data.tournamentId){
        await  updateResult(data);
    }
})
async function updateResult(data) {
    let sw = await pairing.getPairingObj(data.tournamentId);
    if(sw){
        await sw.updateRoundResults()
        await sw.dispose();
        // delete sw;
        io.to('swiss'+ data.tournamentId).emit('swiss' + '-myGames')
        io.to('swiss'+ this.id).emit('swiss' + '-standings')
        rout.api.getTournamentOpenGames
        let tr = await pairing.getPairingObj(data.tournamentId);
        if (tr) {
               await tr.pair();
               tr.dispose();
        }
    }
    else{
        setTimeout(async function () {
                await updateResult(data)
        },1000)
    }
}

class Pairing{
    constructor(tour){
        let self =this;
        this.tour = tour;
        this.rd= tour.round;
        this.id= tour.id;
        this.inputFile = './swp/' + this.id + '.trfx';
        this.outputFile = './swp/' + this.id + '.txt';
        this.players=null;
        this.event = new Events();
        this.event.on('finishPairing',function () {
            io.to('swiss'+ self.id).emit('swiss' + '-myGames')
            io.to('swiss'+ self.id).emit('swiss' + '-standings')
            io.to('swiss'+ self.id).emit('swiss' + '-liveGame')
            
        })
    }
    async pair(){
        if (this.tour.round == 0) {
            let t = Swiss.timeToStartTour(this.tour);
            if (t > 30000) {
                return t;
            }
        }
        this.setFirstRd();
       
        this.players = await swissPlayer.getPlayersInTour(this.id);
        if (this.rd != 0){
            await this.updateRoundResults();
            let notResulted = this.players.find((p)=>(p.results.length < this.rd) || (!p.results[this.rd-1]&& p.results[this.rd-1]!=0))
            if(notResulted)return false;
        } 
        if(this.tour.maxRound ==  this.tour.round)
        {
            this.setEndTour();
            return;
        }
        primerySort(this.players);
        await trfx.create(this);
        await this.doDutch();
        
    }
   
    async updateRoundResults  () {
        if(!this.players){
            this.players = await swissPlayer.getPlayersInTour(this.id);
        }
        for (let i = 0; i < this.players.length; i++) {
            let pl = this.players[i];
            // if (pl.results.length != pl.gameIds.length  ){
            if (pl.results.length != pl.gameIds.length  || pl.results[pl.gameIds.length-1] === null || pl.results[pl.gameIds.length-1] === undefined ){
                // if(pl.results[pl.gameIds.length-1] === null ){
                    let gameId = pl.gameIds[pl.gameIds.length-1];
                    let game = await gameRoot.io.getGameData(gameId);
                    if(game.whiteResult  || game.blackResult ){
                        pl.results[pl.gameIds.length-1] = pl.userName == game.whiteUserName ? game.whiteResult : game.blackResult;
                        pl.markModified('results');
                        await pl.save();
                        io.to('swiss'+ this.id).emit('swiss' + '-standings')
                    }
                // }
            }
        }
    }
    async dispose(){
        this.tour.inUse=false;
        await this.tour.save();
    }
    //private
    async updatePlayerAllData(p){
        p.markModified('opponents');
        p.markModified('colors');
        p.markModified('gameIds');
        p.markModified('results');
        await p.save();
    }
    async setFirstRd(){
       
        if (this.rd == 0) {
            await pairing.putUsersIndb(this.tour);
           
            let plCount = this.tour.players.length;
            let maxRd = this.tour.maxRound;
            if (plCount % 2 == 1){
                if (this.tour.maxRound > plCount) {
                    maxRd = plCount;
                }
            }
            else{
                if (this.tour.maxRound >= plCount) {
                    maxRd = plCount-1;
                }
            }
            this.tour.status = 'closed';
            this.tour.maxRound = maxRd;
            await this.tour.save();
        }
       
    }
    doDutch() {
        let self = this;
        let process = spawn(
            './java/jdk/bin/java.exe', ['-jar', './swp/javafo.jar', this.inputFile, '-p', this.outputFile]
        );
        process.on('exit',  function (code, signal) {
            fs.readFile(self.outputFile, 'utf8', async function(err, data) {
                if(data){
                    if(data.trim()=='0'){
                        self.setEndTour()
                    }
                    else{
                        self.tour.round = self.tour.round+1;
                        await self.tour.save();
                        await self.setPairings(data)   
                    }
                    
                }
              });
        });
    }
    async setPairings (pairs) {
        let self =this;
        let lines = pairs.split('\r');
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            line = line.replace('\n','');
            let opps = line.split(' ');
            if(!opps[0]) continue;
            let p1 =  this.players[Number(opps[0]) -1];
            if(opps[1] == '0'){
               p1.opponents[this.rd] = '-';
               p1.colors[this.rd] = '-';
               p1.results[this.rd] = 1;
               p1.gameIds[this.rd] = '-';
            } else {
                let p2 =   this.players[Number(opps[1])-1]
                p1.opponents[this.rd] = (p2.userName);
                p1.colors[this.rd] = 'w';
                p2.opponents[this.rd] = (p1.userName);
                p2.colors[this.rd] = 'b';
                let gm  = await game.createG(p1,p2,this.tour,i)
                p1.gameIds[this.rd] = (gm.id);
                p2.gameIds[this.rd] = (gm.id);
                await this.updatePlayerAllData(p2)
            }
           await this.updatePlayerAllData(p1)
        }
        
        fs.unlink('./swp/'+this.id+'.txt',async function (err) {
            if (err) throw err;
            self.event.emit('finishPairing')
          });
    
    }
    async setEndTour(){
        this.tour.status = 'finished';
    }
    
}
playersObj={
    getPoints :function (player) {
        let point = swissPlayer.getPoints(player)
        if(point % 1 == 0) point = point + '.0';
        return point;
    }
    
}
pairing = {};

pairing.getPairingObj = async function (tourId) {
    let tour = await Swiss.findOneAndUpdate({_id:tourId, inUse:false}, {inUse:true}, {
        new: true
      });
      if(tour)return new Pairing(tour)
      return false;
}

pairing.creatPlayerObj =  async function (name, tourId, timeControl) {
    let dbPlayer = await userRoot.io.getUserPublicData(name); // for title and time controll rating 
    let newpl = {
        userName: name,
        tournamentId: tourId,
        rating: dbPlayer[timeControl],
        title: dbPlayer.title,
        opponents: [],
        colors: [],
        results: [],
        gameIds: []
    }
    return newpl
}
pairing.putUsersIndb = async function (tour) {
    let timeControl = ut.timeControll(tour.gameDuration, tour.extraTime)
    for (let i = 0; i < tour.players.length; i++) {
        const plName = tour.players[i];
        let newpl = await pairing.creatPlayerObj(plName, tour.id, timeControl)
        let prePlayer = await swissPlayer.findOne({userName:newpl.userName,tournamentId:newpl.tournamentId})
        if(!prePlayer)await swissPlayer.putInDb(newpl);
    }
}

game = {
    createG: async function (p1, p2, tour, boardNo) {
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
                newGame.acceptedTime = now + 10;
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
        return newGame;
    }
};
trfx={
    create: async function (pairing) {
        let data ='012 XX Open Internacional \n';
        data +='XXR 9 \n';
        for (let i = 0; i < pairing.players.length; i++) {
            const pl = pairing.players[i];
            data +='001';
            data +=' '; // part
            data +=trfx.endAlign(i+1, 4);
            data +=' '; // part
            // sex
            data +=' ';
            /// title put player title in db
            data +='   ';
            data +=' '; // part
            // name 
            data +=trfx.startAlign(pl.userName, 33);
            data +=' ';// part
            // rating 
            data +=trfx.endAlign(pl.rating, 4);
            data +=' ';
            /// federation 
            data +='IRI';
            data +=' '; // part
            /// fide Number 
            data +='   13400304';
            data +=' '; // part
            /// birth 
            data +='1978/12/12';
            data +=' '; // part
            // point 
            data +=trfx.endAlign(playersObj.getPoints(pl), 4);
            data +=' '; // part
            // rank 
            data +=trfx.endAlign(1, 4);
            data +='  '; // part
            // prePair 
            // data +=trfxEndAlign('1 w 1', );
            data +=trfx.getPoint(pl,pairing) ;
            data +=''; // part
            data +='\n';
        }
        await myFs.writeFile('./swp/' + pairing.tour.id + '.trfx',data);
        // fs.writeFile('./swp/' + tour.id + '.trfx',data,function () {
        //     doDutch(players,tour);
        // });
    },
    endAlign: function (data, length){
        data = data+'';
       let newData = '';
       let remainingLength = length - data.length;
       for (let i = 0; i < remainingLength; i++) {
           newData = newData+' ';
       };
       return newData+data;
   },
   startAlign : function (data, length){
        data = data+'';
    let newData = '';
    let remainingLength = length - data.length;
    for (let i = 0; i < remainingLength; i++) {
        newData = newData+' ';
    };
    return data + newData;
    },
    getPoint:function (player,pairing) {
        if (pairing.rd == 0) return '';
        let data = '';
        for (let i = 0; i < pairing.rd; i++) {
            let number = trfx.getOpponentNum(player,pairing.players,i)
            data += trfx.endAlign(number,4);
            data +=' ';
            data +=player.colors[i]
            data +=' ';
            data += trfx.startAlign( trfx.getPlayerResult(player,i+1), 3)
        }
        return data
    },
    getPlayerResult: function (player,rd) {
        rd =rd-1;
        if(player.opponents[rd] == '-') return '+';
        if(player.results[rd] == 1/2) return '=';
        return player.results[rd];
    },
    getOpponentNum: function (player,allPlayers,rd) {
        let number = allPlayers.findIndex(pl=>pl.opponents[rd] == player.userName)
        if(number<0){
            number='0000';
        } 
        else{
            number = number+1;
        }
        return number;
    }

}
function primerySort(players) {
    swissPlayer.sortByName(players);
    swissPlayer.sortByTitle(players);
    swissPlayer.sortByRating(players);
}




module.exports = pairing;