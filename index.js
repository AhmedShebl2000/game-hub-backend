const cors = require("cors");
require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  })
);

// These are your original setups
require("./startup/prod")(app);
require("./startup/db")();
require("./startup/routes")(app);

// ✅ Do NOT call app.listen() on Vercel
// Instead, export the serverless handler
module.exports = app;
module.exports.handler = serverless(app);
