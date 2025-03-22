const ut = require('../utility');
const fs = require('fs');
const swPlayer = require('./swissPlayers');
const { spawn } = require('child_process');


pairPlayers = {};

pairPlayers.pair = async function (players, tour) {
    if (tour.maxRound <= tour.round) {
        return false;
    }
    primerySort(players);
    createTrfx(players, doPairing)
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
function createTrfx(players, func) {
    let data = '012 XX Open Internacional \n';
    data += 'XXR 9 \n';
    for (let i = 0; i < players.length; i++) {
        const pl = players[i];
        data += '001';
        data += ' '; // part
        data += trfxEndAlign(i + 1, 4);
        data += ' '; // part
        // sex
        data += ' ';
        /// title put player title in db
        data += '   ';
        data += ' '; // part
        // name 
        data += trfxStartAlign(pl.userName, 33);
        data += ' ';// part
        // rating 
        data += trfxEndAlign(pl.rating, 4);
        data += ' ';
        /// federation 
        data += 'IRI';
        data += ' '; // part
        /// fide Number 
        data += '   13400304';
        data += ' '; // part
        /// birth 
        data += '1978/12/12';
        data += ' '; // part
        // point 
        data += trfxEndAlign('0.0', 4);
        data += ' '; // part
        // rank 
        data += trfxEndAlign(1, 4);
        data += ' '; // part
        // prePair 
        // data +=trfxEndAlign('1 w 1', );
        // data +='1 w 1';
        data += '  '; // part
        data += '\n';
    }
    fs.writeFile('./swp/te.trfx', data, func);
}
function trfxEndAlign(data, length) {
    data = data + '';
    let newData = '';
    let remainingLength = length - data.length;
    for (let i = 0; i < remainingLength; i++) {
        newData = newData + ' ';
    };
    return newData + data;
}
function trfxStartAlign(data, length) {
    data = data + '';
    let newData = '';
    let remainingLength = length - data.length;
    for (let i = 0; i < remainingLength; i++) {
        newData = newData + ' ';
    };
    return data + newData;
}
function doPairing() {
    // fs.readFile('./swp/te.trfx', 'utf8', function(err, data) {
    //     console.log('',data);
    //   });
    //   var child = require('child_process').spawn(
    //     'java', ['-jar', __dirname +'/swp/javafo.jar', (__dirname + '/swp/' + 'te.trfx'), '-p', __dirname + '/swp/' +'te3.txt']
    //   );
    let process = spawn(
        'java', ['-jar', './swp/javafo.jar', ('./swp/' + 'te.trfx'), '-p', './swp/' + 'te101.txt']
    );
    process.on('exit', function (code, signal) {
        console.log('child process exited with ' +
            `code ${code} and signal ${signal}`);
    });

}
function name(params) {

}



module.exports = pairPlayers;