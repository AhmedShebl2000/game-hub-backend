const cors = require("cors");
require("dotenv").config();
const cors = require('cors');

const express = require("express");
const app = express();
app.use(cors());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
