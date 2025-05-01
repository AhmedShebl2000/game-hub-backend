const cors = require("cors");
require("dotenv").config();
const express = require("express");
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  })
);

require("./startup/prod")(app);
require("./startup/db")();
require("./startup/routes")(app);

// ✅ Do NOT call app.listen() on Vercel
// Instead, export the serverless handler
module.exports = app;
module.exports.handler = serverless(app);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
