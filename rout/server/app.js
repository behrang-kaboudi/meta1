//  # فقط ساخت و پیکربندی Express (بدون listen)
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const viewLocals = require('../middlewares/viewLocals');
const { setReqUser } = require('../middlewares/setReqUser');
const routes = require('../routes');

function createApp() {
  const app = express();

  // // ⚠️ وب‌هوک را قبل از json سوار می‌کنیم (داخل خود روتر raw می‌گیریم)
  //todo ????????????????????????
  // 1) روترهایی که باید قبل از json سوار شوند
  for (const r of routes.filter((x) => x.pre)) app.use(r.path, r.router);

  app.use(setReqUser());
  app.use(express.json());
  app.use(fileUpload());
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
  //var viewEngine = require('consolidate');
  // app.engine('ejs', viewEngine.ejs);
  app.set('view engine', 'ejs');

  // locals برای EJS/Vite
  app.use(viewLocals());

  // 2) بقیه روترها
  for (const r of routes.filter((x) => !x.pre)) app.use(r.path, r.router);

  return app;
}

module.exports = { createApp };
