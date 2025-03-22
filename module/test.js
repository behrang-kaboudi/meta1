// const express = require('express');


// const ioSocket = require('socket.io');
// const app = express();
// var server = app.listen(process.env.PORT);
// var io = ioSocket(server);

class test1 {
    constructor() {

    }
    setIO(io) {
        io.on('connect', function (socket) {
            // 
        })

    }
    log() {
    }
}
let t = new test1();
t.log();
module.exports = t;