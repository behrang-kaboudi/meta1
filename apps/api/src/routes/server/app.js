//  # فقط ساخت و پیکربندی Express (بدون listen)
const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const viewLocals = require("../middlewares/viewLocals");
const { setReqUser } = require("../middlewares/setReqUser");
const routes = require("../routes");

function createApp() {
  const app = express();

  // // ⚠️ وب‌هوک را قبل از json سوار می‌کنیم (داخل خود روتر raw می‌گیریم)
  //todo ????????????????????????
  // 1) روترهایی که باید قبل از json سوار شوند
  for (const r of routes.filter((x) => x.pre)) app.use(r.path, r.router);

  app.use(setReqUser());
  app.use(express.json());
  app.use(fileUpload());
  app.use(
    "/public/",
    express.static(path.join(process.env.INIT_CWD, "/apps/web/public/"))
  );

  app.use("/public/", function (req, res, next) {
    let reqAddress = path.normalize(req.path).replace(/%20/g, " ");
    let pubMain = path.join(
      process.env.INIT_CWD,
      "/apps/web/node_modules",
      reqAddress
    );
    if (fs.existsSync(pubMain)) {
      res.sendFile(pubMain);
    } else {
      pubMain = path.join(process.env.INIT_CWD, "/node_modules/", reqAddress);
      if (fs.existsSync(pubMain)) {
        res.sendFile(pubMain);
      } else {
        res.status(404).send("File not found");
      }
    }
    // next();
  });

  app.use(
    "/assets",
    express.static(path.join(process.env.INIT_CWD, "apps/web/react/dist"))
  );
  // app.use(
  //   "/assets",
  //   express.static(
  //     path.resolve(process.env.INIT_CWD, "/apps/web/", "react/dist")
  //   )
  // );

  //var viewEngine = require('consolidate');
  // app.engine('ejs', viewEngine.ejs);
  app.set("view engine", "ejs");

  // locals برای EJS/Vite
  app.use(viewLocals());

  // 2) بقیه روترها
  for (const r of routes.filter((x) => !x.pre)) app.use(r.path, r.router);

  return app;
}

module.exports = { createApp };
