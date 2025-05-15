const user = require("../routes/users");
const auth = require("../routes/auth");
const game = require("../routes/games");
const order = require("../routes/orders");
const express = require("express");
const paypal = require("../routes/paypal");

module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded());
  app.use("/api/users", user);
  app.use("/api/auth", auth);
  app.use("/api/games", game);
  app.use("/api/orders", order);
  app.use("/api/paypal", paypal);
};
