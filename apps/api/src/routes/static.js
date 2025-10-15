const express = require("express");
const config = require("config");
const ut = require("../models/utility");
const Static = require("../models/static/static");
const { Router } = require("express");
const router = Router();

router.get("/page/:id", async (req, res) => {
  let content = await Static.findById(req.params.id);
  res.render(config.get("template") + "/page/static", { content });
});

module.exports = { path: "/static/", router };
