const user = require("../routes/users");
const game = require("../routes/games");
const express = require("express");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", user);
  app.use("/api/games", game);
};
