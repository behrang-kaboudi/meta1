const puzzle = require("./puzzle");
const fileUpload = require("express-fileupload");
const config = require("config");
const Static = require("../models/static/static");
const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => {
  if (req.user.role != "admin") {
    res.redirect("/");
    return;
  }
  res.render(config.get("template") + "/page/admin/dashboard");
});

router.get("/createStaticPage", (req, res) => {
  if (req.user.role != "admin") {
    res.redirect("/");
    return;
  }
  res.render(config.get("template") + "/page/admin/createStaticPage");
});
router.get("/staticPageList", async (req, res) => {
  if (req.user.role != "admin") {
    res.redirect("/");
    return;
  }
  let pages = await Static.find();
  res.render(config.get("template") + "/page/admin/staticPageList", { pages });
});
router.get("/staticEdit/:id", async (req, res) => {
  if (req.user.role != "admin") {
    res.redirect("/");
    return;
  }
  let content = await Static.findById(req.params.id);
  res.render(config.get("template") + "/page/admin/editStaticPage", {
    content,
  });
});
router.get("/puzzlesUpload", (req, res) => {
  if (req.user.role != "admin") {
    res.redirect("/");
    return;
  }
  res.render(config.get("template") + "/page/admin/puzzlesUpload");
});
router.post("/puzzlesUpload", function (req, res) {
  let pgn = req.files.pgn;
  let file =
    process.env.mainDir + "/public/uploads/pgns/" + Date.now() + ".pgn";
  pgn.mv(file, function (err) {
    // if (err)
    //     return res.status(500).send(err);
    res.send("File uploaded!");
    puzzle.putPuzzlesInDb(file);
  });

  // console.log(req.files); // the uploaded file object
});
router.get("/createSwissTournament", (req, res) => {
  if (req.user.role != "admin") {
    res.redirect("/");
    return;
  }
  res.render(config.get("template") + "/page/game/swiss/createSwissTournament");
});
router.post("/createSwissTournament/", function (req, res) {
  // swiss.api.creatSwissTournament(req.body);
});
router.io = {};
router.io.creatStaticPage = async function (data) {
  let static = new Static(data);
  await static.save();
  return true;
  // console.log('d', data);
};
router.io.editStaticPage = async function (data) {
  // let page = await Static.findById(data.id);
  let ans = await Static.updateOne(
    { _id: data.id },
    { $set: { title: data.title, content: data.content } }
  );

  console.log("d", ans);
  // let static = new Static(data)
  // await static.save();
  // return true;
  // console.log('d', data);
};

module.exports = { path: "/admin/", router };
