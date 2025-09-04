// process.env.PORT = process.env.PORT || 6678;
process.env.PORT = process.env.PORT || 3000;
const express = require('express');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const ioSocket = require('socket.io');
const mongoose = require('mongoose');
var viewEngine = require('consolidate');
const { MONGO_URI, ENV } = require('../config/env');
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`[mongo] connected (${ENV})`))
  .catch((err) => console.error('[mongo] connection error:', err.message));

const app = express();
app.use('/public/', function (req, res, next) {
  let reqAddress = path.normalize(req.originalUrl).replace(/%20/g, ' ');
  reqAddress = path.normalize(reqAddress); //.replace(/\\/g, '/');
  reqAddress = path.join(process.env.mainDir, reqAddress);
  if (fs.existsSync(reqAddress)) {
    res.sendFile(reqAddress);
  } else {
    reqAddress = reqAddress.replace('public', 'node_modules');
    res.sendFile(reqAddress);
  }
  // next();
});
// درست: loader.js در ریشه‌ی dist است
app.use('/assets', express.static(path.resolve(process.env.mainDir, 'react/dist')));

app.use(express.json());
app.use(fileUpload());

app.engine('ejs', viewEngine.ejs);
app.set('view engine', 'ejs');

var server = app.listen(process.env.PORT);
var io = ioSocket(server);

let ioFuncs = {};
ioFuncs.connect = (socket, room) => {
  io.on('connect', () => {
    socket.join(room);
    console.log('joind');
  });
};

module.exports = { express, app, io, ioFuncs };
