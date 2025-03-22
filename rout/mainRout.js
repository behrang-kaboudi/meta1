// process.env.PORT = process.env.PORT || 6678;
process.env.PORT = process.env.PORT || 3000;
const express = require('express');
const path = require('path');
const fs = require('fs')
const fileUpload = require('express-fileupload');
const ioSocket = require('socket.io');
const mongoose = require('mongoose');
var viewEngine = require('consolidate')

const app = express();
// app.use('/public/', function (req, res, next) {
//     console.log("🚀 ~ file: mainRout.js ~ line 12 ~ req.originalUrl", req.originalUrl)
//     next();
// });
app.use('/public/', function (req, res, next) {
    let reqAddress = path.normalize(req.originalUrl).replace(/%20/g, ' ');
    // let reqAddress = path.normalize(req.originalUrl).replace(/\\/g, '/');
    reqAddress = path.normalize(reqAddress)//.replace(/\\/g, '/');
    console.log('reqAddress:', reqAddress)
    reqAddress = path.join(process.env.mainDir, reqAddress)
    if (fs.existsSync(reqAddress)) {
        res.sendFile(reqAddress);
    }
    else {
        reqAddress = reqAddress.replace('public', 'node_modules')
        console.log('reqAddress:', reqAddress)
        // reqAddress = reqAddress.replace('public', 'node_modules');
        // console.log(path.join(__dirname, reqAddress))
        res.sendFile(reqAddress);
    }
    // next();
});
// app.use(express.static('public'));
// app.use('/public/', express.static('public'));
// app.use('/public/', function (req, res, next) {
//     let reqAddress = path.normalize(req.originalUrl).replace(/%20/g, ' ');
//     reqAddress = reqAddress.replace('public', 'node_modules')
//     // if (fs.existsSync(reqAddress)) {
//     res.sendFile(process.env.mainDir + '\\' + reqAddress);
//     // }

//     // next();
// });
// app.use(express.static(process.env.mainDir + '/'))

// app.use('/node_modules/', express.static('node_modules'));
// app.use(express.static('public'));
// app.use(express.static('node_modules'));
app.use(express.json());
app.use(fileUpload());

app.engine('ejs', viewEngine.ejs);
app.set('view engine', 'ejs');


var server = app.listen(process.env.PORT);
var io = ioSocket(server);
//local to host
// mongoose.connect(
//         'mongodb://chesshel_pmchessdeh:dehghan1234@yaremehrabanchess.ir:27017/chesshel_pmchess', {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         }
//     )
//     .catch(err => {});
// un coment in site
// mongoose.connect(
//         'mongodb://chesshel_pmchessdeh:dehghan1234@localhost:27017/chesshel_pmchess', {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         }
//     )
///Last connection **********
// mongoose.connect(
//     'mongodb://metaches_startup:startup123456@metachessmind.com:27017/metaches_startup', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }
// )

// apis Main To uncomment
mongoose.connect('mongodb://127.0.0.1/testPmChess', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
// apis
// mongoose.connect('mongodb://localhost/host1', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//pages
ioFuncs = {};
ioFuncs.connect = (socket, room) => {
    io.on('connect', () => {
        socket.join(room);
        console.log('joind',);
    })
}

module.exports = { express, app, io, ioFuncs }