// ساخت http.Server و اتصال Socket.IO + listen
process.env.mainDir = process.env.mainDir || __dirname + '/../../'; // مثل قبل
const path = require('path');
const http = require('http');
const { createApp } = require('./app');
const { connectToMongo } = require('./connect');
const registerSocketHandlers = require('../sockets');
const express = require('express');
const hub = require('../hub');

async function main() {
  if (process.env.NODE_ENV !== 'test') {
    await connectToMongo(); // در تست‌ها رد می‌شود
  }

  const app = createApp();

  // استاتیک‌ها (معادل قبلی /assets)
  app.use('/assets', express.static(path.resolve(process.env.mainDir, 'react/dist')));

  const server = http.createServer(app);
  const io = require('socket.io')(server, {
    /* opts */
  });
  hub.init(io);
  registerSocketHandlers(io); // همه رخدادها از فایل‌های مجزا

  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log('listening on', port));
  return { app, server, io };
}

if (require.main === module) {
  main();
}

module.exports = { main };
