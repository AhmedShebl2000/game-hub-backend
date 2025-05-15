const cors = require("cors");
require("dotenv").config();
const serverless = require("serverless-http");
const express = require("express");
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    // origin: "http://localhost:4200",
    credentials: true,
  })
);

require("./startup/prod")(app);
require("./startup/db")();
require("./startup/routes")(app);

module.exports = app;
module.exports.handler = serverless(app);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
